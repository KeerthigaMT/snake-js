# Contributing to Snake Game

Thank you for your interest in contributing to this project! This document provides guidelines and information to help you get started.

## Table of Contents

- [Project Structure](#project-structure)
- [Development Setup](#development-setup)
- [Running Tests](#running-tests)
- [Linting and Formatting](#linting-and-formatting)
- [Building](#building)
- [Architecture & Design Patterns](#architecture--design-patterns)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)

## Project Structure

```
snake-js/
├── js/
│   ├── models/              # Data models (Board, Snake)
│   │   ├── board.js         # Grid model with cells array
│   │   └── snake.js         # Snake entity with coordinates and state
│   ├── controllers/         # Game logic controllers
│   │   ├── boardController.js   # Board rendering, object placement
│   │   └── snakeController.js   # Snake movement, collision detection
│   └── game.js              # Main game orchestrator
├── tests/                   # Vitest test suites
│   ├── models/              # Model characterization tests
│   ├── controllers/         # Controller characterization tests
│   ├── integration/         # Integration tests
│   └── helpers/             # Test utilities (canvas mocks)
├── public/                  # Static assets served by Vite
│   ├── images/              # Game sprites and graphics
│   └── sounds/              # Audio files
├── app.js                   # Entry point (instantiates Game)
├── index.html               # Main HTML file
└── style.css                # Game styles

```

## Development Setup

### Prerequisites

- **Node.js** >= 18.0.0 (LTS recommended)
- **npm** (comes with Node.js)
- A modern web browser (Chrome, Firefox, Edge, Safari)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/jsdevspace/snake-js.git
   cd snake-js
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   The game will open automatically at `http://localhost:3000` with hot module replacement (HMR).

## Running Tests

The project uses **Vitest** with jsdom for testing. Characterization tests ensure existing behavior is preserved during refactoring.

### Test Commands

```bash
# Run all tests once
npm test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Open Vitest UI (visual test runner)
npm run test:ui
```

### Coverage Requirements

- **Minimum coverage**: 80% for lines, functions, branches, and statements
- Coverage reports are generated in the `coverage/` directory
- View HTML coverage report: `coverage/index.html`

### Writing Tests

- Place unit tests in `tests/models/` or `tests/controllers/` matching the source file structure
- Use `tests/helpers/createMockCanvasContext.js` for mocking Canvas 2D API
- Follow characterization testing patterns: test current behavior before refactoring
- Example test structure:
  ```javascript
  import { describe, it, expect, beforeEach } from 'vitest';
  import MyClass from '../../js/models/myClass.js';

  describe('MyClass - Characterization Tests', () => {
    let instance;
    beforeEach(() => {
      instance = new MyClass();
    });

    it('should initialize with expected default state', () => {
      expect(instance.property).toBe(expectedValue);
    });
  });
  ```

## Linting and Formatting

The project uses **ESLint** (v10.x with flat config) and **Prettier** for code quality and consistency.

### Commands

```bash
# Check for linting errors
npm run lint

# Auto-fix linting errors
npm run lint:fix

# Format all files with Prettier
npm run format

# Check formatting without modifying files
npm run format:check
```

### Configuration

- **ESLint**: `eslint.config.js` (flat config format)
- **Prettier**: `.prettierrc` (singleQuote, tabs, 100 char line width)
- **Pre-commit**: Ensure `npm run lint` and `npm run format:check` pass before committing

## Building

The project uses **Vite** (v7.x) as the build tool.

### Build Commands

```bash
# Create production build (outputs to dist/)
npm run build

# Preview production build locally
npm run preview
```

### Build Output

- **Entry point**: `dist/assets/[name]-[hash].js`
- **Code splitting**: Separate chunks for game, controllers, and models
- **Asset optimization**: Images and sounds copied to `dist/assets/`
- **Minification**: Enabled via esbuild

## Architecture & Design Patterns

### Dependency Injection Pattern

The codebase uses **constructor injection** for inter-module communication, promoting loose coupling and testability.

**Example: Game orchestrator injects dependencies into controllers**

```javascript
// Game.js creates controllers and injects dependencies
this.boardController = new BoardController();
this.snakeController = new SnakeController(
  this.context,           // Canvas context
  this.boardController,   // Board reference for cell lookups
  this.snakeBody,         // Body sprite
  this.snakeHead          // Head sprite
);
```

**Benefits:**
- **Testability**: Easy to mock dependencies in tests
- **Decoupling**: Modules depend on abstractions, not concrete implementations
- **Flexibility**: Controllers can work with different board or rendering implementations

### Module Responsibilities

- **Models** (`js/models/`): Pure data structures, no rendering or game logic
  - `Board`: Grid cell management
  - `Snake`: Snake state and coordinates

- **Controllers** (`js/controllers/`): Game logic and rendering
  - `BoardController`: Board rendering, object placement (food/bombs), cell queries
  - `SnakeController`: Snake movement, collision detection, rendering with rotation

- **Orchestrator** (`js/game.js`): Top-level coordination
  - Asset loading
  - Controller instantiation and wiring
  - Game loop and timing
  - Event handling (keyboard input)
  - Score tracking

### Communication Flow

```
User Input → Game → SnakeController.deltaX/deltaY
Game Loop → SnakeController.move() → BoardController.getCell()
Collision → SnakeController sets flags → Game.update() reads flags
```

## Pull Request Process

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes:**
   - Write code following the coding standards below
   - Add or update tests for your changes
   - Ensure all tests pass: `npm test`
   - Lint and format: `npm run lint && npm run format`

3. **Commit your changes:**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```
   Use conventional commit messages:
   - `feat:` new feature
   - `fix:` bug fix
   - `refactor:` code restructuring
   - `test:` test additions/changes
   - `docs:` documentation changes

4. **Push to your fork and create a PR:**
   ```bash
   git push origin feature/your-feature-name
   ```
   - Open a pull request on GitHub
   - Provide a clear description of the changes
   - Reference any related issues (e.g., "Closes #123")

5. **Code review:**
   - Address reviewer feedback
   - Ensure CI checks pass (linting, tests, build)
   - Squash commits if requested

6. **Merge:**
   - PRs are merged by maintainers after approval
   - Your branch will be deleted after merge

## Coding Standards

### General

- Use **ES6+ module syntax** (`import`/`export`)
- Use **camelCase** for variables and functions
- Use **PascalCase** for class names
- Use **descriptive names** that convey intent
- Avoid magic numbers: extract to constants or configuration

### JSDoc Documentation

- **Every public class** must have a `@class` JSDoc comment
- **Every public method** must have JSDoc with:
  - Description of purpose
  - `@param` tags for all parameters (with types and descriptions)
  - `@returns` tag for return values (with type and description)
  - `@async` tag for async methods

**Example:**
```javascript
/**
 * @class BoardController
 * Controls board rendering and game object placement logic.
 */
export default class BoardController {
  /**
   * Retrieves a cell object at the specified grid coordinates.
   *
   * @param {number} x - The x-coordinate (column index)
   * @param {number} y - The y-coordinate (row index)
   * @returns {Object|undefined} The cell object {x, y} if found, undefined otherwise
   */
  getCell(x, y) {
    return this.board.cells.find((c) => c.x === x && c.y === y);
  }
}
```

### Code Style

- **Indentation**: 2 spaces (enforced by Prettier)
- **Line length**: Max 100 characters (Prettier wraps automatically)
- **Semicolons**: Required (ESLint enforces)
- **Quotes**: Single quotes for strings (Prettier enforces)
- **Trailing commas**: ES5 style (objects, arrays, but not function params)

### Avoid

- Inline comments that just narrate code (e.g., `// Increment counter`)
- Unused variables (ESLint will catch these)
- Console logs in production code (remove after debugging)
- Hardcoded values that should be configurable

---

## Questions?

If you have questions or need help, feel free to:
- Open an issue on GitHub
- Reach out to the maintainers
- Check existing issues and PR discussions

Thank you for contributing! 🎮🐍
