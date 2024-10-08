# vite-plugin-api-generator

gererate default api interface for vite project

## example

```bash
example
├── src
│   ├── services
│   │   ├── modules
│   │   │   ├── login.ts
│   │   │   └── profile.ts
│   │   │   └── ...
```

```ts
// src/services/modules/login.ts
/** @description login api */
export const login = (username: string, password: string) => {
  // login logic
}
export const logout = () => {
  // logout logic
}
```

Auto generate `src/services/index.ts` and watched `src/services/modules` directory.

```ts
import * as login from './modules/login'
import * as profile from './modules/profile'

export const Api = {
  /** @description login api */
  login,
  /** @description profile api */
  profile
}
```

```ts
import { Api } from './services'

Api.login.login('username', 'password')
```

## Install

```bash
npm install vite-plugin-api-generator
```

or

```bash
yarn add vite-plugin-api-generator
```

## Usage

Add the plugin to your Vite config file (usually `vite.config.js`):

```js
import VitePluginApiGenerator from 'vite-plugin-api-generator'

export default {
  plugins: [
    VitePluginApiGenerator({
      // options
      folderName: 'services' // src/services will be generated, you can change it to any string, default is'services'
      className: 'Api', // any string, default is 'Api'
      mode: 'ts' // 'ts' | 'js',default is 'ts' 
      log: true // boolean, default is true
    })
  ]
}
```
