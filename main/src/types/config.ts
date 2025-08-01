export interface AppConfig {
  verbose?: boolean;
  anthropicApiKey?: string;
  // Legacy fields for backward compatibility
  gitRepoPath?: string;
  systemPromptAppend?: string;
  runScript?: string[];
  // Custom claude executable path (for when it's not in PATH)
  claudeExecutablePath?: string;
  // Permission mode for all sessions
  defaultPermissionMode?: 'approve' | 'ignore';
  // Auto-check for updates
  autoCheckUpdates?: boolean;
  // Stravu MCP integration
  stravuApiKey?: string;
  stravuServerUrl?: string;
  // Theme preference
  theme?: 'light' | 'dark';
  // Web server configuration
  webServer?: {
    enabled?: boolean;
    port?: number;
    host?: string;
    cors?: {
      enabled?: boolean;
      origins?: string[];
    };
    auth?: {
      enabled?: boolean;
      apiKey?: string;
    };
  };
}

export interface UpdateConfigRequest {
  verbose?: boolean;
  anthropicApiKey?: string;
  claudeExecutablePath?: string;
  systemPromptAppend?: string;
  defaultPermissionMode?: 'approve' | 'ignore';
  autoCheckUpdates?: boolean;
  stravuApiKey?: string;
  stravuServerUrl?: string;
  theme?: 'light' | 'dark';
  webServer?: {
    enabled?: boolean;
    port?: number;
    host?: string;
    cors?: {
      enabled?: boolean;
      origins?: string[];
    };
    auth?: {
      enabled?: boolean;
      apiKey?: string;
    };
  };
}