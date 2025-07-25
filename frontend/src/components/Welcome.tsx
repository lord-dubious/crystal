import React from 'react';
import { Zap, CheckCircle, GitBranch } from 'lucide-react';
import crystalLogo from '../assets/crystal-logo.svg';

interface WelcomeProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Welcome({ isOpen, onClose }: WelcomeProps) {
  const [dontShowAgain, setDontShowAgain] = React.useState(false);
  
  React.useEffect(() => {
    // Load the preference from database when component mounts
    const loadPreference = async () => {
      if (window.electron?.invoke) {
        try {
          console.log('[Welcome] Loading hide_welcome preference...');
          const result = await window.electron.invoke('preferences:get', 'hide_welcome');
          console.log('[Welcome] Preference result:', result);
          
          if (result?.success) {
            // Handle null (preference doesn't exist) as false
            const shouldHide = result.data === 'true';
            setDontShowAgain(shouldHide);
            console.log('[Welcome] Set dontShowAgain to:', shouldHide);
          } else {
            console.error('[Welcome] Failed to load preference:', result?.error);
          }
        } catch (error) {
          console.error('[Welcome] Error loading preference:', error);
        }
      } else {
        console.warn('[Welcome] Electron invoke not available');
      }
    };
    loadPreference();
  }, []);
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img src={crystalLogo} alt="Crystal" className="h-10 w-10 mr-3" />
              <div>
                <h1 className="text-2xl font-bold">Welcome to Crystal</h1>
                <p className="text-blue-50">Multi-Session Claude Code Manager</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Quick Start Guide */}
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Zap className="h-6 w-6 mr-2 text-yellow-500" />
                Quick Start Guide
              </h2>
              
              {/* Prerequisites */}
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-amber-900 dark:text-amber-200 mb-2 flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Before You Begin
                </h3>
                <ul className="space-y-2 text-amber-800 dark:text-amber-300">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Claude Code must be installed with credentials configured</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>We recommend using a <strong>MAX plan</strong> for best performance</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Crystal runs Claude Code with <code className="bg-amber-200 dark:bg-amber-800 px-1 rounded text-sm">--dangerously-ignore-permissions</code></span>
                  </li>
                </ul>
              </div>

              {/* Steps */}
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 dark:bg-blue-900 rounded-full flex items-center justify-center text-white dark:text-blue-300 font-semibold">
                    1
                  </div>
                  <div className="ml-4 flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Create or Select a Project</h4>
                    <ul className="text-gray-600 dark:text-gray-400 space-y-1 text-sm">
                      <li>• Point to a <strong>new directory</strong> - Crystal will create it and initialize git</li>
                      <li>• Or select an <strong>existing git repository</strong></li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 dark:bg-blue-900 rounded-full flex items-center justify-center text-white dark:text-blue-300 font-semibold">
                    2
                  </div>
                  <div className="ml-4 flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Create Sessions</h4>
                    <ul className="text-gray-600 dark:text-gray-400 space-y-1 text-sm">
                      <li>• Enter a prompt describing what you want Claude to do</li>
                      <li>• <strong>Create multiple sessions</strong> with different prompts to explore various approaches</li>
                      <li>• Or <strong>run the same prompt multiple times</strong> to choose the best result</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 dark:bg-blue-900 rounded-full flex items-center justify-center text-white dark:text-blue-300 font-semibold">
                    3
                  </div>
                  <div className="ml-4 flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Work with Results</h4>
                    <ul className="text-gray-600 dark:text-gray-400 space-y-1 text-sm">
                      <li>• View changes in the <strong>View Diff tab</strong></li>
                      <li>• <strong>Continue conversations</strong> to refine the solution</li>
                      <li>• <strong>Rebase back to main</strong> when you're done</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Key Features */}
            <section className="border-t pt-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                <GitBranch className="h-5 w-5 mr-2" />
                Key Features
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500 flex-shrink-0" />
                  <span>Parallel sessions with git worktrees</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500 flex-shrink-0" />
                  <span>Real-time status updates</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500 flex-shrink-0" />
                  <span>Session persistence</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500 flex-shrink-0" />
                  <span>Git integration</span>
                </div>
              </div>
            </section>
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <button
            onClick={async () => {
              const newValue = !dontShowAgain;
              console.log('[Welcome Debug] Don\'t show again clicked:', newValue);
              setDontShowAgain(newValue);
              if (window.electron?.invoke) {
                try {
                  const result = await window.electron.invoke('preferences:set', 'hide_welcome', newValue ? 'true' : 'false');
                  if (result?.success) {
                    console.log('[Welcome Debug] Successfully set hide_welcome preference to', newValue);
                  } else {
                    console.error('[Welcome Debug] Failed to set preference:', result?.error);
                  }
                } catch (error) {
                  console.error('[Welcome Debug] Error setting preference:', error);
                }
              }
              // Close the popup when don't show again is clicked and set to true
              if (newValue) {
                onClose();
              }
            }}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              dontShowAgain
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {dontShowAgain ? "Will hide on next launch" : "Don't show this again"}
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}