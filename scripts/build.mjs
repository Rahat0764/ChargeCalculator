import { build } from 'vite';
import config from '../vite.config.mjs';

try {
  await build({
    ...config,
    configFile: false,
  });
} catch (err) {
  console.error('Build error:', err);
  process.exit(1);
}
