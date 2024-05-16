import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'primereact': 'primereact',
      'primeicons': 'primeicons',
      'primeflex': 'primeflex/primeflex.css'
    },
    extensions: ['.js', '.jsx', '.json', '.css'], 
  }
  
});
