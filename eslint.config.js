import js from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';

export default [
	js.configs.recommended,
	prettierConfig,
	{
		languageOptions: {
			ecmaVersion: 2024,
			sourceType: 'module',
			globals: {
				window: 'readonly',
				document: 'readonly',
				Image: 'readonly',
				Audio: 'readonly',
				console: 'readonly',
				requestAnimationFrame: 'readonly',
				cancelAnimationFrame: 'readonly',
				addEventListener: 'readonly',
				setInterval: 'readonly',
				clearInterval: 'readonly',
				alert: 'readonly',
				performance: 'readonly',
			},
		},
		rules: {
			'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
			'no-console': 'off',
			'no-debugger': 'warn',
		},
	},
	{
		ignores: ['dist/', 'node_modules/', 'coverage/', '.cursor/'],
	},
];
