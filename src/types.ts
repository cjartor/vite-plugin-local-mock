/**
 * Configuration options for the vite-plugin-local-mock plugin
 */
export interface PluginConfig {
  /**
   * Mock files directory, default is 'mock'
   */
  dir?: string;
  /**
   * Enable or disable the plugin, default is true
   */
  enable?: boolean;
  /**
   * Path map configuration file name (without extension), located in the mock directory
   */
  pathMapConfig?: string;
  /**
   * Response delay in milliseconds (simulates network latency)
   */
  delay?: number;
  /**
   * Whether to use pnpm workspace, default is false
   */
  isPnpmWorkspace?: boolean;
}

/**
 * Router mapping between URL patterns and mock file paths
 */
export interface Router {
  /**
   * URL pattern, can use Express-like patterns with params (e.g. '/api/users/:id')
   */
  url: string;
  /**
   * Path to the mock file (without extension)
   */
  path: string;
}

/**
 * Parameters extracted from URL
 */
export interface RouterParams {
  [key: string]: string | null;
}

/**
 * Mock data response structure
 */
export interface MockResponse {
  __mock: boolean;
  [key: string]: any;
}

/**
 * Mock handler function type
 */
export type MockHandler = (params: any) => MockResponse;
