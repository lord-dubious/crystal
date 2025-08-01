import React, { useState, useEffect, useCallback, useRef } from 'react';
import { flushSync } from 'react-dom';
import Editor from '@monaco-editor/react';
import { ChevronRight, ChevronDown, File, Folder, RefreshCw, Plus, Trash2, FolderPlus, Search, X } from 'lucide-react';
import { MonacoErrorBoundary } from './MonacoErrorBoundary';
import { useTheme } from '../contexts/ThemeContext';
import { debounce } from '../utils/debounce';

interface FileItem {
  name: string;
  path: string;
  isDirectory: boolean;
  size?: number;
  modified?: Date;
}

interface FileTreeNodeProps {
  file: FileItem;
  level: number;
  onFileClick: (file: FileItem) => void;
  onRefresh: (path: string) => void;
  onDelete: (file: FileItem) => void;
  selectedPath: string | null;
  expandedDirs: Set<string>;
  onToggleDir: (path: string) => void;
  searchQuery?: string;
}

function FileTreeNode({ file, level, onFileClick, onRefresh, onDelete, selectedPath, expandedDirs, onToggleDir, searchQuery }: FileTreeNodeProps) {
  const isExpanded = expandedDirs.has(file.path);
  const isSelected = selectedPath === file.path;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (file.isDirectory) {
      onToggleDir(file.path);
    } else {
      onFileClick(file);
    }
  };

  const handleRefresh = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRefresh(file.path);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(file);
  };

  // Highlight matching text
  const highlightText = (text: string) => {
    if (!searchQuery) return text;
    
    // Escape special regex characters
    const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escapedQuery})`, 'gi'));
    return (
      <>
        {parts.map((part, index) => 
          part.toLowerCase() === searchQuery.toLowerCase() ? (
            <span key={index} className="bg-yellow-600 text-gray-900">
              {part}
            </span>
          ) : (
            part
          )
        )}
      </>
    );
  };

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <div
        className={`flex items-center px-2 py-1 hover:bg-gray-700 cursor-pointer group ${
          isSelected ? 'bg-blue-600' : ''
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleClick}
        onDoubleClick={(e) => e.preventDefault()}
      >
        {file.isDirectory ? (
          <>
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 mr-1 text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 mr-1 text-gray-400" />
            )}
            <Folder className="w-4 h-4 mr-2 text-blue-400" />
          </>
        ) : (
          <>
            <div className="w-4 h-4 mr-1" />
            <File className="w-4 h-4 mr-2 text-gray-400" />
          </>
        )}
        <span className="flex-1 text-sm truncate text-gray-200">{highlightText(file.name)}</span>
        {file.isDirectory && (
          <button
            onClick={handleRefresh}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-600 rounded text-gray-400 hover:text-gray-200"
            title="Refresh folder"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        )}
        <button
          onClick={handleDelete}
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-600 rounded ml-1"
          title={`Delete ${file.isDirectory ? 'folder' : 'file'}`}
        >
          <Trash2 className="w-3 h-3 text-red-400" />
        </button>
      </div>
    </div>
  );
}

interface FileTreeProps {
  sessionId: string;
  onFileSelect: (file: FileItem) => void;
  selectedPath: string | null;
}

function FileTree({ sessionId, onFileSelect, selectedPath }: FileTreeProps) {
  const [files, setFiles] = useState<Map<string, FileItem[]>>(new Map());
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set(['']));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [showNewItemDialog, setShowNewItemDialog] = useState<'file' | 'folder' | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const newItemInputRef = useRef<HTMLInputElement>(null);
  const pendingToggleRef = useRef<string | null>(null);

  const loadFiles = useCallback(async (path: string = '') => {
    setLoading(true);
    setError(null);
    try {
      const result = await window.electronAPI.invoke('file:list', {
        sessionId,
        path
      });
      
      if (result.success) {
        setFiles(prev => new Map(prev).set(path, result.files));
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load files');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    loadFiles('');
  }, [loadFiles]);

  const toggleDir = useCallback((path: string) => {
    // Prevent double-toggles from React StrictMode
    if (pendingToggleRef.current === path) {
      console.log('Ignoring duplicate toggle for:', path);
      return;
    }
    
    pendingToggleRef.current = path;
    
    // Use flushSync to ensure state updates are applied immediately
    flushSync(() => {
      setExpandedDirs(prev => {
        const next = new Set(prev);
        if (next.has(path)) {
          next.delete(path);
          console.log('Collapsed:', path);
        } else {
          next.add(path);
          console.log('Expanded:', path);
          // Load files immediately if needed
          if (!files.has(path)) {
            loadFiles(path);
          }
        }
        return next;
      });
    });
    
    // Clear the pending toggle after a short delay
    setTimeout(() => {
      if (pendingToggleRef.current === path) {
        pendingToggleRef.current = null;
      }
    }, 50);
  }, [files, loadFiles]);

  const handleDelete = useCallback(async (file: FileItem) => {
    const confirmMessage = file.isDirectory 
      ? `Are you sure you want to delete the folder "${file.name}" and all its contents?`
      : `Are you sure you want to delete the file "${file.name}"?`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      const result = await window.electronAPI.invoke('file:delete', {
        sessionId,
        filePath: file.path
      });
      
      if (result.success) {
        // Refresh the parent directory
        const parentPath = file.path.split('/').slice(0, -1).join('/') || '';
        loadFiles(parentPath);
        
        // If the deleted file was selected, clear the selection
        if (selectedPath === file.path) {
          onFileSelect(null as any);
        }
      } else {
        setError(`Failed to delete ${file.isDirectory ? 'folder' : 'file'}: ${result.error}`);
      }
    } catch (err) {
      console.error('Failed to delete:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete item');
    }
  }, [sessionId, loadFiles, selectedPath, onFileSelect]);

  const handleNewFile = useCallback(() => {
    setShowNewItemDialog('file');
    setNewItemName('');
  }, []);

  const handleNewFolder = useCallback(() => {
    setShowNewItemDialog('folder');
    setNewItemName('');
  }, []);

  const handleCreateNewItem = useCallback(async () => {
    if (!newItemName.trim()) return;

    try {
      const isFolder = showNewItemDialog === 'folder';
      const filePath = isFolder ? `${newItemName}/.gitkeep` : newItemName;
      
      const result = await window.electronAPI.invoke('file:write', {
        sessionId,
        filePath,
        content: ''
      });

      if (result.success) {
        loadFiles('');
        setShowNewItemDialog(null);
        setNewItemName('');
      } else {
        setError(`Failed to create ${isFolder ? 'folder' : 'file'}: ${result.error}`);
      }
    } catch (err) {
      console.error('Failed to create item:', err);
      setError(err instanceof Error ? err.message : 'Failed to create item');
    }
  }, [sessionId, loadFiles, newItemName, showNewItemDialog]);

  // Focus input when dialog is shown
  useEffect(() => {
    if (showNewItemDialog && newItemInputRef.current) {
      newItemInputRef.current.focus();
    }
  }, [showNewItemDialog]);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Filter function for search
  const matchesSearch = useCallback((file: FileItem): boolean => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return file.name.toLowerCase().includes(query) || file.path.toLowerCase().includes(query);
  }, [searchQuery]);

  // Check if any child matches search
  const hasMatchingChild = useCallback((dirPath: string): boolean => {
    const queue = [dirPath];
    const visited = new Set<string>();
    
    while (queue.length > 0) {
      const currentPath = queue.shift()!;
      if (visited.has(currentPath)) continue;
      visited.add(currentPath);
      
      const items = files.get(currentPath) || [];
      for (const item of items) {
        if (matchesSearch(item)) return true;
        if (item.isDirectory) {
          queue.push(item.path);
        }
      }
    }
    return false;
  }, [files, matchesSearch]);

  const renderTree = (path: string, level: number = 0): React.ReactNode => {
    const items = files.get(path) || [];
    
    return items
      .filter(file => {
        if (!searchQuery) return true;
        // Show file if it matches or if it's a directory with matching children
        return matchesSearch(file) || (file.isDirectory && hasMatchingChild(file.path));
      })
      .map(file => (
        <React.Fragment key={file.path}>
          <FileTreeNode
            file={file}
            level={level}
            onFileClick={onFileSelect}
            onRefresh={loadFiles}
            onDelete={handleDelete}
            selectedPath={selectedPath}
            expandedDirs={expandedDirs}
            onToggleDir={toggleDir}
            searchQuery={searchQuery}
          />
          {file.isDirectory && expandedDirs.has(file.path) && (
            <div onClick={(e) => e.stopPropagation()} style={{ minHeight: '1px' }}>
              {renderTree(file.path, level + 1)}
            </div>
          )}
        </React.Fragment>
      ));
  };

  // Auto-expand directories when searching
  useEffect(() => {
    if (searchQuery) {
      // Expand all directories to show search results
      const allDirs = new Set<string>(['']);
      files.forEach((items, dirPath) => {
        allDirs.add(dirPath);
        items.forEach(item => {
          if (item.isDirectory) {
            allDirs.add(item.path);
          }
        });
      });
      setExpandedDirs(allDirs);
    }
    // Note: We don't collapse when search is cleared to preserve user's expanded state
  }, [searchQuery, files]);

  // Focus search input when shown
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle search with Cmd/Ctrl+F
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        setShowSearch(!showSearch);
      }
      
      // ESC key handling
      if (e.key === 'Escape') {
        // Close new item dialog if open
        if (showNewItemDialog) {
          setShowNewItemDialog(null);
          setNewItemName('');
        }
        // Clear search if active
        else if (searchQuery) {
          setSearchQuery('');
          if (searchInputRef.current) {
            searchInputRef.current.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSearch, searchQuery, showNewItemDialog]);

  if (loading && files.size === 0) {
    return <div className="p-4 text-gray-400">Loading files...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-400">Error: {error}</div>;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-2 border-b border-gray-700">
        <span className="text-sm font-medium text-gray-200">Files</span>
        <div className="flex gap-1">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className={`p-1 rounded text-gray-400 hover:text-gray-200 ${showSearch ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
            title="Search files (Cmd/Ctrl+F)"
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            onClick={handleNewFile}
            className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-gray-200"
            title="New file"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={handleNewFolder}
            className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-gray-200"
            title="New folder"
          >
            <FolderPlus className="w-4 h-4" />
          </button>
          <button
            onClick={() => loadFiles('')}
            className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-gray-200"
            title="Refresh all"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
      {showSearch && (
        <div className="p-2 border-b border-gray-700">
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search files..."
              className="w-full pl-8 pr-8 py-1 bg-gray-900 border border-gray-600 rounded text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-0.5 hover:bg-gray-700 rounded"
              >
                <X className="w-3 h-3 text-gray-400" />
              </button>
            )}
          </div>
          {searchQuery && (
            <div className="mt-1 text-xs text-gray-500">
              Press ESC to clear • Cmd/Ctrl+F to toggle search
            </div>
          )}
        </div>
      )}
      {showNewItemDialog && (
        <div className="p-2 border-b border-gray-700 bg-gray-900">
          <form onSubmit={(e) => { e.preventDefault(); handleCreateNewItem(); }}>
            <div className="flex items-center gap-2">
              <input
                ref={newItemInputRef}
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder={`Enter ${showNewItemDialog} name...`}
                className="flex-1 px-2 py-1 bg-gray-800 border border-gray-600 rounded text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={!newItemName.trim()}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded text-sm"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => { setShowNewItemDialog(null); setNewItemName(''); }}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      {error && (
        <div className="px-3 py-2 bg-red-900 text-red-200 text-sm border-b border-red-800">
          {error}
        </div>
      )}
      <div className="flex-1 overflow-auto" onClick={(e) => e.stopPropagation()}>
        {renderTree('')}
      </div>
    </div>
  );
}

interface FileEditorProps {
  sessionId: string;
}

export function FileEditor({ sessionId }: FileEditorProps) {
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [originalContent, setOriginalContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const editorRef = useRef<unknown>(null);

  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const hasUnsavedChanges = fileContent !== originalContent;

  const loadFile = useCallback(async (file: FileItem) => {
    if (file.isDirectory) return;
    
    setLoading(true);
    setError(null);
    try {
      const result = await window.electronAPI.invoke('file:read', {
        sessionId,
        filePath: file.path
      });
      
      if (result.success) {
        setFileContent(result.content);
        setOriginalContent(result.content);
        setSelectedFile(file);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load file');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);


  const handleEditorMount = (editor: unknown) => {
    editorRef.current = editor;
  };

  const handleEditorChange = (value: string | undefined) => {
    setFileContent(value || '');
  };

  // Auto-save functionality
  const autoSave = useCallback(
    debounce(async () => {
      if (!selectedFile || selectedFile.isDirectory || fileContent === originalContent) return;
      
      try {
        const result = await window.electronAPI.invoke('file:write', {
          sessionId,
          filePath: selectedFile.path,
          content: fileContent
        });
        
        if (result.success) {
          setOriginalContent(fileContent);
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to auto-save file');
      }
    }, 1000), // Auto-save after 1 second of inactivity
    [sessionId, selectedFile, fileContent, originalContent]
  );

  // Trigger auto-save when content changes
  useEffect(() => {
    if (fileContent !== originalContent && selectedFile && !selectedFile.isDirectory) {
      autoSave();
    }
  }, [fileContent, originalContent, selectedFile, autoSave]);


  return (
    <div className="h-full flex">
      <div className="w-64 bg-gray-800 border-r border-gray-700">
        <FileTree
          sessionId={sessionId}
          onFileSelect={loadFile}
          selectedPath={selectedFile?.path || null}
        />
      </div>
      <div className="flex-1 flex flex-col">
        {selectedFile ? (
          <>
            <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
              <div className="flex items-center gap-2">
                <File className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-200">
                  {selectedFile.path}
                  {hasUnsavedChanges && <span className="text-yellow-400 ml-2">●</span>}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                {hasUnsavedChanges ? (
                  <>
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                    <span className="text-yellow-400">Auto-saving...</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-green-400 rounded-full" />
                    <span className="text-green-400">All changes saved</span>
                  </>
                )}
              </div>
            </div>
            {error && (
              <div className="px-4 py-2 bg-red-900 text-red-200 text-sm">
                Error: {error}
              </div>
            )}
            <div className="flex-1">
              <MonacoErrorBoundary>
                <Editor
                  theme={isDarkMode ? 'vs-dark' : 'light'}
                  value={fileContent}
                  onChange={handleEditorChange}
                  onMount={handleEditorMount}
                  options={{
                    minimap: { enabled: true },
                    fontSize: 14,
                    wordWrap: 'on',
                    automaticLayout: true,
                    scrollBeyondLastLine: false,
                  }}
                  language={getLanguageFromPath(selectedFile.path)}
                />
              </MonacoErrorBoundary>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            {loading ? 'Loading...' : 'Select a file to edit'}
          </div>
        )}
      </div>
    </div>
  );
}

function getLanguageFromPath(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase();
  const languageMap: Record<string, string> = {
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    json: 'json',
    md: 'markdown',
    py: 'python',
    rb: 'ruby',
    go: 'go',
    rs: 'rust',
    cpp: 'cpp',
    c: 'c',
    h: 'c',
    hpp: 'cpp',
    java: 'java',
    cs: 'csharp',
    php: 'php',
    html: 'html',
    css: 'css',
    scss: 'scss',
    sass: 'sass',
    less: 'less',
    xml: 'xml',
    yaml: 'yaml',
    yml: 'yaml',
    toml: 'toml',
    ini: 'ini',
    sh: 'shell',
    bash: 'shell',
    zsh: 'shell',
    fish: 'shell',
    ps1: 'powershell',
    dockerfile: 'dockerfile',
    makefile: 'makefile',
    sql: 'sql',
    graphql: 'graphql',
    vue: 'vue',
    svelte: 'svelte',
  };
  
  return languageMap[ext || ''] || 'plaintext';
}