import { Router, Request, Response } from 'express';
import { AppServices } from '../ipc/types';
import { Logger } from '../utils/logger';

export function createApiRouter(services: AppServices, logger: Logger): Router {
  const router = Router();

  // Helper function to simulate IPC calls
  const simulateIpcCall = async (handler: string, ...args: any[]) => {
    try {
      // Map handler names to actual service methods
      switch (handler) {
        // Session handlers
        case 'sessions:getAll':
          return services.sessionManager.getAllSessions();
        case 'sessions:get':
          return services.sessionManager.getSession(args[0]);
        case 'sessions:create': {
          // Extract session creation parameters from request body
          const createData = args[0];
          return services.sessionManager.createSession(
            createData.name,
            createData.worktreePath,
            createData.prompt,
            createData.worktreeName,
            createData.permissionMode,
            createData.projectId,
            createData.isMainRepo,
            createData.autoCommit,
            createData.folderId
          );
        }
        case 'sessions:delete':
          return await services.sessionManager.archiveSession(args[0]);
        case 'sessions:getOutput':
          return services.sessionManager.getSessionOutput(args[0]);
        case 'sessions:getConversation':
          return services.sessionManager.getConversationMessages(args[0]);
        case 'sessions:continue':
          return services.sessionManager.continueConversation(args[0], args[1]);

        // Project handlers
        case 'projects:getAll':
          return services.databaseService.getAllProjects();
        case 'projects:create': {
          const projectData = args[0];
          return services.databaseService.createProject(
            projectData.name,
            projectData.path,
            projectData.systemPrompt,
            projectData.runScript,
            projectData.mainBranch,
            projectData.buildScript,
            projectData.defaultPermissionMode,
            projectData.openIdeCommand
          );
        }
        case 'projects:get':
          return services.databaseService.getProject(args[0]);
        case 'projects:update':
          return services.databaseService.updateProject(args[0], args[1]);
        case 'projects:delete':
          return services.databaseService.deleteProject(args[0]);
        case 'projects:activate': {
          const project = services.databaseService.setActiveProject(args[0]);
          if (project) {
            services.sessionManager.setActiveProject(project);
          }
          return project;
        }

        // Config handlers
        case 'config:get':
          return services.configManager.getConfig();
        case 'config:update':
          return await services.configManager.updateConfig(args[0]);

        // App handlers
        case 'app:getVersion':
          return services.app.getVersion();
        case 'app:getPlatform':
          return process.platform;
        case 'app:isPackaged':
          return services.app.isPackaged;

        default:
          throw new Error(`Unknown handler: ${handler}`);
      }
    } catch (error) {
      logger.error(`[ApiRouter] Error in ${handler}:`, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  };

  // Wrapper to handle responses consistently
  const handleRequest = (handler: string, paramExtractor?: (req: Request) => any[]) => {
    return async (req: Request, res: Response) => {
      try {
        let args: any[];

        if (paramExtractor) {
          args = paramExtractor(req);
        } else {
          // Default parameter extraction
          args = [req.params.id, req.body].filter(arg => arg !== undefined);
        }

        const result = await simulateIpcCall(handler, ...args);

        // Wrap result in success response if not already wrapped
        if (result && typeof result === 'object' && 'success' in result) {
          res.json(result);
        } else {
          res.json({ success: true, data: result });
        }
      } catch (error) {
        logger.error(`[ApiRouter] Request failed for ${handler}:`, error instanceof Error ? error : new Error(String(error)));
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    };
  };

  // Session Management Routes
  router.get('/sessions', handleRequest('sessions:getAll', () => []));
  router.post('/sessions', handleRequest('sessions:create', (req) => [req.body]));
  router.get('/sessions/:id', handleRequest('sessions:get', (req) => [req.params.id]));
  router.delete('/sessions/:id', handleRequest('sessions:delete', (req) => [req.params.id]));

  // Session Interaction Routes
  router.post('/sessions/:id/continue', handleRequest('sessions:continue', (req) => [req.params.id, req.body.message]));
  router.get('/sessions/:id/output', handleRequest('sessions:getOutput', (req) => [req.params.id]));
  router.get('/sessions/:id/conversation', handleRequest('sessions:getConversation', (req) => [req.params.id]));

  // Project Management Routes
  router.get('/projects', handleRequest('projects:getAll', () => []));
  router.post('/projects', handleRequest('projects:create', (req) => [req.body]));
  router.get('/projects/:id', handleRequest('projects:get', (req) => [parseInt(req.params.id, 10)]));
  router.put('/projects/:id', handleRequest('projects:update', (req) => [parseInt(req.params.id, 10), req.body]));
  router.delete('/projects/:id', handleRequest('projects:delete', (req) => [parseInt(req.params.id, 10)]));
  router.post('/projects/:id/activate', handleRequest('projects:activate', (req) => [parseInt(req.params.id, 10)]));

  // Configuration Routes
  router.get('/config', handleRequest('config:get', () => []));
  router.post('/config', handleRequest('config:update', (req) => [req.body]));

  // App Info Routes
  router.get('/app/version', handleRequest('app:getVersion', () => []));
  router.get('/app/platform', handleRequest('app:getPlatform', () => []));
  router.get('/app/packaged', handleRequest('app:isPackaged', () => []));

  // Git Routes (if needed)
  router.get('/git/:sessionId/diff', async (req: Request, res: Response) => {
    try {
      // Get session to find worktree path
      const session = services.sessionManager.getSession(req.params.sessionId);
      if (!session) {
        return res.status(404).json({
          success: false,
          error: 'Session not found'
        });
      }

      const result = await services.gitDiffManager.getGitDiff(session.worktreePath);
      res.json({ success: true, data: result });
    } catch (error) {
      logger.error('[ApiRouter] Git diff failed:', error instanceof Error ? error : new Error(String(error)));
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Git diff failed'
      });
    }
  });

  // Stravu Routes (if authenticated)
  router.get('/stravu/status', async (req: Request, res: Response) => {
    try {
      const connectionState = services.stravuAuthManager.getConnectionState();
      res.json({ success: true, data: connectionState });
    } catch (error) {
      logger.error('[ApiRouter] Stravu status failed:', error instanceof Error ? error : new Error(String(error)));
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Stravu status failed'
      });
    }
  });

  router.get('/stravu/notebooks', async (req: Request, res: Response) => {
    try {
      if (!services.stravuAuthManager.isConnected()) {
        return res.status(401).json({ success: false, error: 'Not connected to Stravu' });
      }
      const notebooks = await services.stravuNotebookService.getNotebooks();
      res.json({ success: true, data: notebooks });
    } catch (error) {
      logger.error('[ApiRouter] Stravu notebooks failed:', error instanceof Error ? error : new Error(String(error)));
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get notebooks'
      });
    }
  });

  return router;
}
