import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


export default defineConfig({
  define: {
    'global': {},
  },
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // 외부 IP에서 접근 가능하도록 설정
    port: 5173,        // 포트 설정
  }
})