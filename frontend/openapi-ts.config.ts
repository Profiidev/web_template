import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: 'http://localhost:5173/openapi.json',
  logs: './build',
  output: {
    path: 'src/lib/client',
    postProcess: ['prettier']
  },
  plugins: [
    {
      enums: true,
      name: '@hey-api/typescript'
    },
    {
      name: '@hey-api/sdk'
    },
    {
      bigInt: false,
      name: '@hey-api/transformers'
    },
    {
      baseUrl: '',
      name: '@hey-api/client-fetch',
      runtimeConfigPath: '$lib/backend/config'
    }
  ]
});
