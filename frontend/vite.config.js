import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';


// let cert = fs.readFileSync(path.resolve(__dirname, '..', 'localhost.pem'))

// console.log('certFront', cert)


export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      allowedHosts: ['localhost', 'my.local.ip', 'docker-lan-share-app.onrender.com'],      // https: {
      //   key: fs.readFileSync(path.resolve(__dirname, 'certs', 'localhost-key.pem')),
      //   cert: fs.readFileSync(path.resolve(__dirname, 'certs', 'localhost.pem')),
      // },
      proxy: {
        '/socket.io': {
          target: env.VITE_BACKEND_URL,
          ws: true,
        },
      },
    },
  };
});
