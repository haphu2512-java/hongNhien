import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        fs: {
            // Cho phép truy cập các file ngoài thư mục public
            allow: ['..'],
        },
    },
    resolve: {
        extensions: ['.js', '.jsx']
    }
});