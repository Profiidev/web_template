import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({ BACKEND_URL: { static: true } });
