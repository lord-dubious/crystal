import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { Server } from 'http';
import path from 'path';
import fs from 'fs';
import { ConfigManager } from './configManager';
import { Logger } from '../utils/logger';
import { AppServices } from '../ipc/types';
import { createApiRouter } from './apiRouter';

export interface WebServerConfig {
  enabled: boolean;
  port: number;
  host: string;
  cors: {
    enabled: boolean;
    origins: string[];
  };
  auth: {
    enabled: boolean;
    apiKey?: string;
  };
}

export class WebServerManager {
  private app: Express;
  private server: Server | null = null;
  private config: WebServerConfig;
  private logger: Logger;
  private services: AppServices;

  constructor(configManager: ConfigManager, logger: Logger, services: AppServices) {
    this.logger = logger;
    this.services = services;
    this.app = express();
    
    // Load configuration with defaults
    const userConfig = configManager.getConfig().webServer || {};
    this.config = {
      enabled: userConfig.enabled ?? false,
      port: userConfig.port ?? 3001,
      host: userConfig.host ?? '0.0.0.0',
      cors: {
        enabled: userConfig.cors?.enabled ?? true,
        origins: userConfig.cors?.origins ?? ['*']
      },
      auth: {
        enabled: userConfig.auth?.enabled ?? false,
        apiKey: userConfig.auth?.apiKey
      }
    };

    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    // JSON parsing with error handling
    this.app.use(express.json({
      limit: '10mb',
      type: 'application/json'
    }));
    this.app.use(express.urlencoded({ extended: true }));

    // CORS configuration
    if (this.config.cors.enabled) {
      const hasWildcard = this.config.cors.origins.includes('*');
      const corsOptions = {
        origin: hasWildcard ? true : this.config.cors.origins,
        credentials: !hasWildcard, // Cannot use credentials with wildcard origin
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
        optionsSuccessStatus: 200 // Some legacy browsers choke on 204
      };
      this.app.use(cors(corsOptions));

      if (hasWildcard) {
        this.logger.warn('[WebServer] Using wildcard CORS origin - credentials disabled for security');
      }
    }

    // Request logging (before auth to log all requests)
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      this.logger.info(`[WebServer] ${req.method} ${req.path} from ${req.ip || req.connection.remoteAddress || 'unknown'}`);
      next();
    });

    // Authentication middleware
    if (this.config.auth.enabled) {
      this.app.use(this.authMiddleware.bind(this));
    }
  }

  private authMiddleware(req: Request, res: Response, next: NextFunction): void {
    // Skip auth for health check
    if (req.path === '/health') {
      next();
      return;
    }

    const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');

    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '' || apiKey !== this.config.auth.apiKey) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Valid API key required'
      });
      return;
    }

    next();
  }

  private setupRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (req: Request, res: Response) => {
      res.json({ 
        success: true, 
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: this.services.app.getVersion()
      });
    });

    // API routes
    this.app.use('/api', createApiRouter(this.services, this.logger));

    // Serve frontend static files if directory exists
    const frontendPath = path.resolve(__dirname, '../../../frontend/dist');
    if (fs.existsSync(frontendPath)) {
      this.app.use(express.static(frontendPath));
    } else {
      this.logger.warn(`[WebServer] Frontend directory not found at ${frontendPath}, skipping static file serving`);
    }

    // Fallback for SPA routing, but do not mask API or static file errors
    this.app.get('*', (req: Request, res: Response, next: NextFunction) => {
      // Do not handle API routes or requests for static files (with a dot in the last segment)
      if (
        req.path.startsWith('/api') ||
        /\.[^/]+$/.test(req.path)
      ) {
        return next();
      }
      res.sendFile('index.html', { root: frontendPath }, (err) => {
        if (err) {
          res.status(404).json({
            success: false,
            error: 'Not found',
            message: 'Frontend not available'
          });
        }
      });
    });

    // Error handling middleware (must be after routes)
    this.app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
      this.logger.error(`[WebServer] Error handling ${req.method} ${req.path}:`, err instanceof Error ? err : new Error(String(err)));
      const isDevelopment = process.env.NODE_ENV === 'development';
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: isDevelopment ? err.message : 'An error occurred processing your request'
      });
    });
  }

  async start(): Promise<void> {
    if (!this.config.enabled) {
      this.logger.info('[WebServer] Web server is disabled in configuration');
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        this.server = this.app.listen(this.config.port, this.config.host, () => {
          this.logger.info(`[WebServer] Server started on http://${this.config.host}:${this.config.port}`);
          this.logger.info(`[WebServer] CORS enabled: ${this.config.cors.enabled}`);
          this.logger.info(`[WebServer] Auth enabled: ${this.config.auth.enabled}`);
          resolve();
        });

        this.server.on('error', (error: Error) => {
          this.logger.error('[WebServer] Server error:', error);
          reject(error);
        });
      } catch (error) {
        this.logger.error('[WebServer] Failed to start server:', error instanceof Error ? error : new Error(String(error)));
        reject(error);
      }
    });
  }

  async stop(): Promise<void> {
    if (!this.server) {
      return;
    }

    return new Promise((resolve) => {
      this.server!.close(() => {
        this.logger.info('[WebServer] Server stopped');
        this.server = null;
        resolve();
      });
    });
  }

  isRunning(): boolean {
    return this.server !== null;
  }

  getConfig(): WebServerConfig {
    return { ...this.config };
  }

  updateConfig(newConfig: Partial<WebServerConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.logger.info('[WebServer] Configuration updated');
  }
}
