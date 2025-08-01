import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 3001,
        proxy: {
            '/cloudinary-proxy': {
                target: 'https://res.cloudinary.com',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/cloudinary-proxy/, ''),
            },
            // Thêm đoạn này để proxy API về backend
            '/api': {
                target: 'http://localhost:5000', // hoặc 5001 nếu backend chạy ở đó
                changeOrigin: true,
                // Không cần rewrite nếu BE đã có prefix /api
            },
        },
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    define: {
        __CLOUDINARY_CLOUD_NAME__: JSON.stringify('dojbjbbjw'),
        __CLOUDINARY_BASE_URL__: JSON.stringify('https://res.cloudinary.com/dojbjbbjw'),
    },
});
