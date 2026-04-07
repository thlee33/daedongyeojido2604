import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // GitHub Pages 배포 등을 위해 상대 경로 설정
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/proxy-ngii': {
        target: 'https://map.ngii.go.kr',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy-ngii/, '/spcemapserver/korea_old_map/wms'),
        headers: { 'Referer': 'https://map.ngii.go.kr' }
      },
      '/proxy-forest': {
        target: 'https://map.forest.go.kr',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy-forest/, ''),
        headers: { 'Referer': 'https://map.forest.go.kr' }
      },
      '/v-sat': {
        target: 'https://xdworld.vworld.kr',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/v-sat/, '/2d/Satellite/service'),
        headers: { 'Referer': 'https://xdworld.vworld.kr' }
      },
      '/v-base': {
        target: 'https://xdworld.vworld.kr',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/v-base/, '/2d/Base/service'),
        headers: { 'Referer': 'https://xdworld.vworld.kr' }
      },
      '/v-hybrid': {
        target: 'https://xdworld.vworld.kr',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/v-hybrid/, '/2d/Hybrid/service'),
        headers: { 'Referer': 'https://xdworld.vworld.kr' }
      }
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});
