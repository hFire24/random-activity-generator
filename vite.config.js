import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/random-activity-generator/',
  plugins: [react()],
  resolve: {
    extensions: ['.js', '.jsx', '.json']
  }
});
