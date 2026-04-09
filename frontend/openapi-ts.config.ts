import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: 'http://localhost:5173/openapi.json',
  output: {
    path: 'src/lib/client',
    postProcess: ['prettier']
  },
  plugins: [
    {
      name: '@hey-api/typescript',
      enums: true
    },
    {
      name: '@hey-api/sdk'
    },
    {
      name: '@hey-api/transformers',
      bigInt: false
    },
    {
      name: '@hey-api/client-fetch',
      runtimeConfigPath: '$lib/backend/config',
      baseUrl: ''
    }
  ],
  logs: './build'
});
