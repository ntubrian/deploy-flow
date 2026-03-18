import tailwindcss from '@tailwindcss/vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

const isE2ETest = process.env.DISABLE_TANSTACK_DEVTOOLS === 'true'

const config = defineConfig({
  plugins: [
    ...(!isE2ETest ? [devtools()] : []),
    tsconfigPaths({ projects: ['./tsconfig.json'] }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
    nitro(),
  ],
})

export default config
