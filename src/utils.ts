import http from 'node:http';
import { parse } from 'regexparam';
import queryString from 'query-string';
import type { Router, RouterParams } from './types';

/**
 * Check if the request is an AJAX request
 */
export function isAjax(req: http.IncomingMessage): boolean {
  if (req.method?.toLowerCase() === 'post') {
    return true;
  }
  if (req.headers.accept?.includes('application/json')) {
    return true;
  }
  if (req.headers.accept?.includes('application/x-www-form-urlencoded')) {
    return true;
  }
  return false;
}

/**
 * Process mock data, handling both static data and function handlers
 */
export function makeMockData(v: any, params: any): any {
  let result: any;
  if (typeof v === 'function') {
    result = v(params);
  } else if (v === null || typeof v !== 'object') {
    result = v;
  } else {
    result = Array.isArray(v) ? [] : {};
    for (const key in v) {
      if (Object.prototype.hasOwnProperty.call(v, key)) {
        result[key] = makeMockData(v[key], params);
      }
    }
  }

  return result;
}

/**
 * Execute pattern matching to extract parameters from URL
 */
function exec(
  path: string,
  result: {
    keys: string[];
    pattern: RegExp;
  }
): RouterParams {
  const out: RouterParams = {};
  let i = 0;
  const matches = result.pattern.exec(path) as RegExpExecArray;
  while (i < result.keys.length) {
    out[result.keys[i]] = matches[++i] || null;
  }
  return out;
}

/**
 * Parse REST-style URL with path parameters
 */
export function parseRestUrl(url: string, path: string): RouterParams | null {
  const parser = parse(path);
  if (!parser.pattern.test(url)) {
    return null;
  }
  return exec(url, parser);
}

/**
 * Find matching route and extract parameters from URL
 */
function getRestUrlInfo(list: Router[], url: string): [string?, RouterParams?] {
  for (let i = 0; i < list.length; i++) {
    const res = parseRestUrl(url, list[i].url);
    if (res) {
      return [list[i].path, res];
    }
  }
  return [];
}

/**
 * Get mock path info and parameters from URL
 */
export function getMockPathInfo(
  url: http.IncomingMessage['url'] = '',
  routers: Router[]
): [string, Record<string, any>] {
  const [reqPath = '', reqSearch = ''] = url.split('?');
  let filePath = reqPath;
  let restParams: Record<string, any> = {};
  const queryParams = reqSearch ? queryString.parse(reqSearch) : {};

  if (routers?.length) {
    const [rPath, rParams] = getRestUrlInfo(routers, reqPath);
    if (rPath) {
      filePath = rPath;
      restParams = rParams || {};
    }
  }
  return [filePath, { ...queryParams, ...restParams }];
}
