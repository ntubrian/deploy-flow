import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset';
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    ...nxE2EPreset(__filename, {
      cypressDir: 'cypress',
      webServerCommands: {
        default:
          'pnpm nx run @deploy-flow/client:build && pnpm exec node apps/client/scripts/patch-cypress-ssr.mjs && PORT=4200 pnpm nx run @deploy-flow/client:start',
      },
    }),
    baseUrl: 'http://localhost:4200',
  },
});
