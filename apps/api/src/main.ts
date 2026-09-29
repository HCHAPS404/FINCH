/**
 * API entrypoint. Configuration is validated before anything listens (README §61):
 * a malformed environment stops the process here, with the keys named and no values.
 */
import { loadConfig } from '@finch/config';

import { createApp } from './app.js';

const config = loadConfig(process.env);
const app = await createApp(config);
await app.listen({ port: config.public.apiPort, host: '0.0.0.0' });
