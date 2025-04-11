# vite-plugin-local-mock

A lightweight and flexible mock data plugin for Vite, perfect for frontend development without a backend API.

## Features

- 🚀 Simple setup and configuration
- 🔄 Support for dynamic routes with REST-style parameters
- 📊 Support for dynamic response generation based on request parameters
- ⏱️ Configurable response delay to simulate network latency
- 📝 Detailed logging for easy debugging
- 💾 Response caching for improved performance

## Installation

```bash
npm i vite-plugin-local-mock -D
# or
yarn add vite-plugin-local-mock -D
# or
pnpm add vite-plugin-local-mock -D
```

## Setup

Add the plugin to your `vite.config.js` or `vite.config.ts`:

```js
import { defineConfig } from 'vite';
import localMock from 'vite-plugin-local-mock';

export default defineConfig({
  plugins: [
    localMock({
      dir: 'mock',
      enable: true,
      pathMapConfig: 'mockMap',
      delay: 300, // milliseconds
    }),
  ],
});
```

## Configuration Options

| Option          | Type      | Default  | Description                                                 |
| --------------- | --------- | -------- | ----------------------------------------------------------- |
| `dir`           | `string`  | `'mock'` | Directory for mock files                                    |
| `enable`        | `boolean` | `true`   | Enable or disable the plugin                                |
| `pathMapConfig` | `string`  | `''`     | Filename for path mapping configuration (without extension) |
| `delay`         | `number`  | `0`      | Response delay in milliseconds to simulate network latency  |

## Usage

### Basic Usage

Create a mock file in the `mock` directory. The filename should match the request path and use the `.cjs` extension:

```js
// mock/api/user.cjs
module.exports = {
  // Required flag to enable mocking
  __mock: true,

  // Your response data
  code: 0,
  data: {
    name: 'John Doe',
    email: 'john@example.com',
    role: 'admin',
  },
};
```

### Dynamic Responses

You can define dynamic responses based on request parameters:

```js
// mock/api/login.cjs
module.exports = (params) => ({
  __mock: true,
  code: 0,
  data: {
    username: params.username || 'guest',
    token: 'mock-token-' + Date.now(),
    loginTime: new Date().toISOString(),
  },
});
```

### REST API Mocking

For RESTful APIs with dynamic parameters, configure a mapping file:

1. Set the `pathMapConfig` option in your Vite config:

```js
localMock({
  pathMapConfig: 'mockMap',
});
```

2. Create a `mockMap.cjs` file in your mock directory:

```js
// mock/mockMap.cjs
module.exports = [
  {
    url: 'api/users/:id',
    path: 'api/user-detail',
  },
  {
    url: 'api/products/:category/:id',
    path: 'api/product-detail',
  },
];
```

3. Create the corresponding mock files:

```js
// mock/api/user-detail.cjs
module.exports = (params) => ({
  __mock: true,
  code: 0,
  data: {
    id: params.id,
    name: `User ${params.id}`,
    email: `user${params.id}@example.com`,
  },
});
```

## Examples

### GET Request with Query Parameters

Request: `GET /api/users?page=1&limit=10`

Mock file: `mock/api/users.cjs`

```js
module.exports = (params) => ({
  __mock: true,
  code: 0,
  data: {
    page: parseInt(params.page) || 1,
    limit: parseInt(params.limit) || 10,
    total: 100,
    users: Array.from({ length: parseInt(params.limit) || 10 }, (_, i) => ({
      id: i + 1 + (parseInt(params.page) - 1 || 0) * (parseInt(params.limit) || 10),
      name: `User ${i + 1}`,
    })),
  },
});
```

### POST Request with Body

Request: `POST /api/login` with body `{ "username": "admin", "password": "123456" }`

Mock file: `mock/api/login.cjs`

```js
module.exports = (params) => {
  if (params.username === 'admin' && params.password === '123456') {
    return {
      __mock: true,
      code: 0,
      data: {
        token: 'mock-token-admin',
        username: 'admin',
        role: 'administrator',
      },
    };
  } else {
    return {
      __mock: true,
      code: 1001,
      message: 'Invalid username or password',
    };
  }
};
```
