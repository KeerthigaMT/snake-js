import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		environment: 'jsdom',
		globals: true,
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html', 'lcov'],
			include: ['js/models/**/*.js', 'js/controllers/**/*.js'],
			exclude: ['node_modules/**', 'tests/**', '**/*.test.js', '**/*.spec.js'],
			// Coverage thresholds set to ≥80% for models and controllers directories
			// As characterization tests are added in subsequent work orders, these thresholds
			// will enforce the requirement. They are configured now as part of WO-001 infrastructure setup.
			thresholds: {
				lines: 80,
				functions: 80,
				branches: 80,
				statements: 80,
			},
			all: true,
		},
		include: ['tests/**/*.{test,spec}.js'],
		exclude: ['node_modules/**', 'dist/**'],
	},
});
