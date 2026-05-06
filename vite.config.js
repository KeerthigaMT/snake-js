import { defineConfig } from 'vite';

export default defineConfig({
	// Server configuration for development
	server: {
		port: 3000,
		open: true,
		strictPort: false,
	},

	// Build configuration for production
	build: {
		target: 'es2024',
		outDir: 'dist',
		assetsDir: 'assets',
		sourcemap: false,
		minify: 'esbuild',

		// Optimize bundle size
		rollupOptions: {
			output: {
				entryFileNames: 'assets/[name]-[hash].js',
				chunkFileNames: 'assets/[name]-[hash].js',
				assetFileNames: 'assets/[name]-[hash][extname]',

				// Manual chunking strategy for better caching
				manualChunks: {
					// Game logic
					game: ['./js/game.js'],
					// Controllers
					controllers: [
						'./js/controllers/boardController.js',
						'./js/controllers/snakeController.js',
					],
					// Models
					models: ['./js/models/board.js', './js/models/snake.js'],
				},
			},
		},

		// Compression and optimization
		reportCompressedSize: true,
		chunkSizeWarningLimit: 50, // Warn if chunks exceed 50KB
	},

	// Production base path (can be configured for GitHub Pages, etc.)
	base: './',

	// Asset handling
	publicDir: 'public',

	// Preview server configuration
	preview: {
		port: 4173,
		strictPort: false,
	},

	// Optimize dependencies
	optimizeDeps: {
		include: [],
	},
});
