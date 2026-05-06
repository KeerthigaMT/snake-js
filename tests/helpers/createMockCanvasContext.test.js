import { describe, it, expect, vi } from 'vitest';
import { createMockCanvasContext } from './createMockCanvasContext.js';

describe('createMockCanvasContext', () => {
	it('should return a mock canvas context object', () => {
		const ctx = createMockCanvasContext();

		expect(ctx).toBeDefined();
		expect(typeof ctx).toBe('object');
	});

	it('should have all required drawing methods as spy functions', () => {
		const ctx = createMockCanvasContext();

		// Drawing rectangles
		expect(vi.isMockFunction(ctx.drawImage)).toBe(true);
		expect(vi.isMockFunction(ctx.clearRect)).toBe(true);
		expect(vi.isMockFunction(ctx.fillRect)).toBe(true);
		expect(vi.isMockFunction(ctx.strokeRect)).toBe(true);

		// Drawing text
		expect(vi.isMockFunction(ctx.fillText)).toBe(true);
		expect(vi.isMockFunction(ctx.measureText)).toBe(true);

		// Path methods
		expect(vi.isMockFunction(ctx.beginPath)).toBe(true);
		expect(vi.isMockFunction(ctx.closePath)).toBe(true);
		expect(vi.isMockFunction(ctx.arc)).toBe(true);
		expect(vi.isMockFunction(ctx.fill)).toBe(true);
		expect(vi.isMockFunction(ctx.stroke)).toBe(true);

		// Transformation methods
		expect(vi.isMockFunction(ctx.save)).toBe(true);
		expect(vi.isMockFunction(ctx.restore)).toBe(true);
		expect(vi.isMockFunction(ctx.translate)).toBe(true);
		expect(vi.isMockFunction(ctx.rotate)).toBe(true);
	});

	it('should allow spy functions to be called without errors', () => {
		const ctx = createMockCanvasContext();

		expect(() => {
			ctx.clearRect(0, 0, 100, 100);
			ctx.fillRect(10, 10, 50, 50);
			ctx.save();
			ctx.translate(100, 100);
			ctx.rotate(Math.PI / 4);
			ctx.drawImage({}, 0, 0);
			ctx.restore();
			ctx.beginPath();
			ctx.arc(50, 50, 20, 0, Math.PI * 2);
			ctx.fill();
		}).not.toThrow();
	});

	it('should track method calls correctly', () => {
		const ctx = createMockCanvasContext();

		ctx.fillRect(10, 20, 30, 40);
		ctx.fillRect(50, 60, 70, 80);

		expect(ctx.fillRect).toHaveBeenCalledTimes(2);
		expect(ctx.fillRect).toHaveBeenNthCalledWith(1, 10, 20, 30, 40);
		expect(ctx.fillRect).toHaveBeenNthCalledWith(2, 50, 60, 70, 80);
	});

	it('should provide a working measureText mock', () => {
		const ctx = createMockCanvasContext();

		const metrics = ctx.measureText('Hello');

		expect(metrics).toBeDefined();
		expect(metrics.width).toBe(50); // 'Hello' has 5 characters * 10
		expect(typeof metrics.actualBoundingBoxAscent).toBe('number');
	});

	it('should support canvas property access', () => {
		const ctx = createMockCanvasContext();

		expect(ctx.canvas).toBeDefined();
		expect(ctx.canvas.width).toBe(800);
		expect(ctx.canvas.height).toBe(600);
	});

	it('should support style properties', () => {
		const ctx = createMockCanvasContext();

		ctx.fillStyle = '#FF0000';
		expect(ctx.fillStyle).toBe('#FF0000');

		ctx.strokeStyle = 'blue';
		expect(ctx.strokeStyle).toBe('blue');

		ctx.lineWidth = 5;
		expect(ctx.lineWidth).toBe(5);

		ctx.globalAlpha = 0.5;
		expect(ctx.globalAlpha).toBe(0.5);
	});

	it('should support text properties', () => {
		const ctx = createMockCanvasContext();

		ctx.font = '16px Arial';
		expect(ctx.font).toBe('16px Arial');

		ctx.textAlign = 'center';
		expect(ctx.textAlign).toBe('center');

		ctx.textBaseline = 'middle';
		expect(ctx.textBaseline).toBe('middle');
	});

	it('should be resettable for multiple test cases', () => {
		const ctx1 = createMockCanvasContext();
		ctx1.fillRect(1, 2, 3, 4);
		expect(ctx1.fillRect).toHaveBeenCalledTimes(1);

		const ctx2 = createMockCanvasContext();
		expect(ctx2.fillRect).toHaveBeenCalledTimes(0);
	});
});
