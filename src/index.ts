import { ViteDevServer, PluginOption } from 'vite';
import getRawBody from 'raw-body';
import path from 'node:path';
import { createRequire } from 'node:module';
import http from 'node:http';
import fs from 'node:fs';
import { isAjax, makeMockData, getMockPathInfo } from './utils';
import type { PluginConfig, Router } from './types';

const require = createRequire(import.meta.url);

/**
 * Mock data response with optional delay
 * @param res - HTTP response object
 * @param data - Mock data to send
 * @param delay - Delay in milliseconds
 */
function sendMockResponse(res: http.ServerResponse, data: any, delay?: number): void {
  const sendResponse = () => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
  };

  if (delay && delay > 0) {
    setTimeout(sendResponse, delay);
  } else {
    sendResponse();
  }
}

/**
 * Vite plugin for local mock data
 * @param opt - Plugin configuration options
 * @returns Vite plugin
 */
const viteLocalMockPlugin = (opt?: PluginConfig): PluginOption => {
  // Default configuration
  const options: Required<PluginConfig> = {
    dir: 'mock',
    enable: true,
    pathMapConfig: '',
    delay: 0,
    ...opt,
  };

  return {
    name: 'vite-plugin-local-mock',
    apply: 'serve',
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req: http.IncomingMessage, res: http.ServerResponse, next: Function) => {
        if (!options.enable) {
          next();
          return;
        }

        if (!isAjax(req)) {
          next();
          return;
        }

        try {
          let routers: Router[] = [];
          if (options.pathMapConfig) {
            const pathMapFile = path.join(process.cwd(), options.dir, options.pathMapConfig + '.cjs');

            if (fs.existsSync(pathMapFile)) {
              try {
                delete require.cache[pathMapFile];
                routers = require(pathMapFile);
              } catch (err) {
                // Error loading router config
              }
            }
          }

          const [filePath, urlParams] = getMockPathInfo(req.url, routers);
          const mockPath = path.join(process.cwd(), options.dir, filePath + '.cjs');

          if (!fs.existsSync(mockPath)) {
            next();
            return;
          }

          try {
            delete require.cache[mockPath];
            const mockModule = require(mockPath);

            if (!mockModule.__mock) {
              next();
              return;
            }

            let bodyData = {};
            try {
              const bodyStr = await getRawBody(req, {
                encoding: 'utf-8',
              });
              if (bodyStr) {
                bodyData = JSON.parse(bodyStr);
              }
            } catch (bodyError) {
              // Error parsing request body
            }

            const params = {
              ...bodyData,
              ...urlParams,
            };

            const mockData = makeMockData(mockModule, params);

            sendMockResponse(res, mockData, options.delay);
          } catch (moduleError) {
            next();
          }
        } catch (error) {
          next();
        }
      });
    },
  };
};

export default viteLocalMockPlugin;
