import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor-react';
            }
            if (id.includes('gsap') || id.includes('lenis') || id.includes('motion')) {
              return 'vendor-motion-gsap';
            }
            if (id.includes('three') || id.includes('ogl')) {
              return 'vendor-3d';
            }
            if (id.includes('lucide-react') || id.includes('react-icons')) {
              return 'vendor-icons';
            }
          }
        },
      },
    },
  },
});

