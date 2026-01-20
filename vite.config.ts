import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      // Use chokidar patterns to exclude directories from file watching
      // This prevents ENOSPC errors when the inotify limit is reached
      ignored: [
        // Exclude all node_modules directories (including parent directories)
        '**/node_modules/**',
        // Exclude parent project directories using absolute paths
        path.resolve(__dirname, '../Joy-AI-backend/**'),
        path.resolve(__dirname, '../Joy-AI-Replit/**'),
        // Standard exclusions
        '**/.git/**',
        '**/dist/**',
        '**/build/**',
        '**/.next/**',
        '**/.vite/**',
        '**/coverage/**',
        '**/.cache/**',
        '**/.*/**', // Hidden files and directories
      ],
      // Use polling as fallback if inotify fails (slower but more reliable)
      usePolling: false,
    },
  },
})
