import { vi } from 'vitest';

/**
 * Creates a mock CanvasRenderingContext2D for testing Canvas API interactions.
 * 
 * This factory returns a mock context object with all standard Canvas 2D rendering methods
 * stubbed as Vitest spy functions (vi.fn()). This allows tests to:
 * - Assert that specific Canvas methods were called
 * - Verify call arguments and sequences
 * - Mock return values for methods like measureText
 * 
 * @returns {Object} Mock CanvasRenderingContext2D with spy methods
 * 
 * @example
 * import { createMockCanvasContext } from './helpers/createMockCanvasContext.js';
 * 
 * test('renders snake on canvas', () => {
 *   const ctx = createMockCanvasContext();
 *   renderer.draw(ctx);
 *   expect(ctx.drawImage).toHaveBeenCalledTimes(1);
 * });
 */
export function createMockCanvasContext() {
  return {
    // Drawing rectangles
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    strokeRect: vi.fn(),

    // Drawing text
    fillText: vi.fn(),
    strokeText: vi.fn(),
    measureText: vi.fn((text) => ({
      width: text.length * 10,
      actualBoundingBoxLeft: 0,
      actualBoundingBoxRight: text.length * 10,
      actualBoundingBoxAscent: 10,
      actualBoundingBoxDescent: 2
    })),

    // Drawing paths
    beginPath: vi.fn(),
    closePath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    arc: vi.fn(),
    arcTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    bezierCurveTo: vi.fn(),
    rect: vi.fn(),

    // Filling and stroking
    fill: vi.fn(),
    stroke: vi.fn(),
    clip: vi.fn(),

    // Transformations
    save: vi.fn(),
    restore: vi.fn(),
    scale: vi.fn(),
    rotate: vi.fn(),
    translate: vi.fn(),
    transform: vi.fn(),
    setTransform: vi.fn(),
    resetTransform: vi.fn(),

    // Image drawing
    drawImage: vi.fn(),
    createImageData: vi.fn(),
    getImageData: vi.fn(),
    putImageData: vi.fn(),

    // Pixel manipulation
    createLinearGradient: vi.fn(() => ({
      addColorStop: vi.fn()
    })),
    createRadialGradient: vi.fn(() => ({
      addColorStop: vi.fn()
    })),
    createPattern: vi.fn(),

    // Canvas state
    canvas: {
      width: 800,
      height: 600,
      getContext: vi.fn()
    },

    // Properties (using getters/setters for realistic behavior)
    _fillStyle: '#000000',
    get fillStyle() {
      return this._fillStyle;
    },
    set fillStyle(value) {
      this._fillStyle = value;
    },

    _strokeStyle: '#000000',
    get strokeStyle() {
      return this._strokeStyle;
    },
    set strokeStyle(value) {
      this._strokeStyle = value;
    },

    _lineWidth: 1,
    get lineWidth() {
      return this._lineWidth;
    },
    set lineWidth(value) {
      this._lineWidth = value;
    },

    _lineCap: 'butt',
    get lineCap() {
      return this._lineCap;
    },
    set lineCap(value) {
      this._lineCap = value;
    },

    _lineJoin: 'miter',
    get lineJoin() {
      return this._lineJoin;
    },
    set lineJoin(value) {
      this._lineJoin = value;
    },

    _globalAlpha: 1.0,
    get globalAlpha() {
      return this._globalAlpha;
    },
    set globalAlpha(value) {
      this._globalAlpha = value;
    },

    _globalCompositeOperation: 'source-over',
    get globalCompositeOperation() {
      return this._globalCompositeOperation;
    },
    set globalCompositeOperation(value) {
      this._globalCompositeOperation = value;
    },

    _font: '10px sans-serif',
    get font() {
      return this._font;
    },
    set font(value) {
      this._font = value;
    },

    _textAlign: 'start',
    get textAlign() {
      return this._textAlign;
    },
    set textAlign(value) {
      this._textAlign = value;
    },

    _textBaseline: 'alphabetic',
    get textBaseline() {
      return this._textBaseline;
    },
    set textBaseline(value) {
      this._textBaseline = value;
    },

    _shadowColor: 'transparent',
    get shadowColor() {
      return this._shadowColor;
    },
    set shadowColor(value) {
      this._shadowColor = value;
    },

    _shadowBlur: 0,
    get shadowBlur() {
      return this._shadowBlur;
    },
    set shadowBlur(value) {
      this._shadowBlur = value;
    },

    _shadowOffsetX: 0,
    get shadowOffsetX() {
      return this._shadowOffsetX;
    },
    set shadowOffsetX(value) {
      this._shadowOffsetX = value;
    },

    _shadowOffsetY: 0,
    get shadowOffsetY() {
      return this._shadowOffsetY;
    },
    set shadowOffsetY(value) {
      this._shadowOffsetY = value;
    }
  };
}
