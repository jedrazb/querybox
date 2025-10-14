# Contributing to QueryBox

Thank you for your interest in contributing to QueryBox! This document provides guidelines and instructions for contributing.

## Getting Started

### Prerequisites

- Node.js 18 or higher
- pnpm (recommended) - `npm install -g pnpm`
- Git

### Development Setup

1. Fork the repository
2. Clone your fork:

   ```bash
   git clone https://github.com/your-username/querybox.git
   cd querybox
   ```

3. Install dependencies:

   ```bash
   pnpm install
   ```

4. Start the development server:

   ```bash
   pnpm dev
   ```

5. Make your changes and test them in the browser at `http://localhost:5173`

## Development Workflow

### Project Structure

- `src/` - Source code

  - `components/` - UI components
  - `api/` - API clients
  - `styles/` - CSS styles
  - `types.ts` - TypeScript type definitions
  - `QueryBox.ts` - Main widget class
  - `index.ts` - Entry point

- `examples/` - Usage examples
- `dist/` - Built files (generated)

### Making Changes

1. Create a new branch:

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following the code style guidelines

3. Test your changes:

   ```bash
   pnpm type-check
   pnpm build
   ```

4. Commit your changes:
   ```bash
   git commit -m "feat: add your feature description"
   ```

### Commit Message Convention

We follow conventional commits:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

### Code Style

- Use TypeScript for all new code
- Follow the existing code style
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Keep functions small and focused
- Avoid unnecessary complexity

### Testing

Currently, the project uses manual testing via the examples. When adding new features:

1. Test in the dev server (`pnpm dev`)
2. Test the built version (`pnpm build` then `pnpm preview`)
3. Test in different environments (Next.js, WordPress, standalone HTML)

## Pull Request Process

1. Update the README.md with details of changes if needed
2. Update examples if you've changed the API
3. Ensure the build passes (`npm run build`)
4. Create a Pull Request with a clear title and description
5. Link any related issues

### PR Checklist

- [ ] Code follows the project's style guidelines
- [ ] Self-review of code completed
- [ ] Documentation updated if needed
- [ ] Examples updated if API changed
- [ ] Build passes without errors (`pnpm build`)
- [ ] Type checking passes (`pnpm type-check`)
- [ ] Tested in multiple browsers (if applicable)

## Feature Requests and Bug Reports

### Bug Reports

When reporting bugs, please include:

- Clear description of the issue
- Steps to reproduce
- Expected behavior
- Actual behavior
- Browser/environment information
- Code samples or screenshots if applicable

### Feature Requests

When requesting features, please:

- Clearly describe the feature
- Explain the use case
- Provide examples if possible
- Discuss potential implementation approaches

## Questions?

Feel free to open an issue for questions or join our discussions.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
