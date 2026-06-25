import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import fs from 'fs';

// Setup PWA Assets on startup/build
const publicDir = path.resolve(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}
const srcImage = path.resolve(__dirname, 'src/assets/images/agrogomes_logo_1781982470066.jpg');
if (fs.existsSync(srcImage)) {
  fs.copyFileSync(srcImage, path.join(publicDir, 'logo.png'));
  fs.copyFileSync(srcImage, path.join(publicDir, 'logo-192.png'));
  fs.copyFileSync(srcImage, path.join(publicDir, 'logo-512.png'));
  fs.copyFileSync(srcImage, path.join(publicDir, 'logo-192-maskable.png'));
  fs.copyFileSync(srcImage, path.join(publicDir, 'logo-512-maskable.png'));
}


export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
