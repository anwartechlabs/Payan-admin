import { sites } from '@openai/sites-vite-plugin'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const environment = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), sites()],
    define: {
      'import.meta.env.VITE_GOOGLE_MAPS_WEB_API_KEY': JSON.stringify(
        environment.GOOGLE_MAPS_WEB_API_KEY ?? '',
      ),
    },
  }
})
