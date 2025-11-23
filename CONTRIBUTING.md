# Contributing to GitHub Team Tracker

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what's best for the community
- Show empathy towards other contributors

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in Issues
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Your environment (OS, Node version, etc.)
   - Sample configuration (remove sensitive data!)

### Suggesting Enhancements

1. Check if the enhancement has been suggested
2. Create a new issue describing:
   - The problem you're trying to solve
   - Your proposed solution
   - Alternative solutions considered
   - How it benefits other users

### Pull Requests

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Test thoroughly
5. Commit with conventional commits format:
   ```
   feat: add support for custom date ranges
   fix: resolve rate limiting issue
   docs: update README with new examples
   ```
6. Push to your fork: `git push origin feature/amazing-feature`
7. Open a Pull Request

## Development Setup

```bash
# Clone your fork
git clone https://github.com/your-username/github-team-tracker.git
cd github-team-tracker

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your test configuration
nano .env

# Run in development mode
npm run dev
```

## Project Structure

```
src/
├── index.ts              # CLI entry point
├── types.ts              # TypeScript interfaces
├── config.ts             # Configuration loader
├── github-client.ts      # GitHub API wrapper
├── metrics-calculator.ts # KPI calculation
└── report-generator.ts   # Report formatting
```

## Coding Standards

### TypeScript

- Use strict TypeScript mode
- Define interfaces for all data structures
- Avoid `any` types
- Use async/await instead of promises chains

### Code Style

- Use Prettier for formatting
- Follow existing code conventions
- Keep functions small and focused
- Add comments for complex logic

### Naming Conventions

- Use camelCase for variables and functions
- Use PascalCase for classes and interfaces
- Use UPPER_CASE for constants
- Use descriptive names

## Testing

Before submitting a PR:

1. Test with different configurations:
   ```bash
   # Test with different tracking periods
   npm run track -- --days 1
   npm run track -- --days 7
   npm run track -- --days 30
   ```

2. Test all output formats:
   ```bash
   npm run track
   npm run track -- --json
   npm run track -- --html
   ```

3. Test with edge cases:
   - Empty repositories
   - No team members
   - Invalid tokens
   - Rate limiting scenarios

4. Build successfully:
   ```bash
   npm run build
   ```

## Adding New Features

### Adding a New Metric

1. Update `types.ts` with new interface fields
2. Implement calculation in `metrics-calculator.ts`
3. Update report generators in `report-generator.ts`
4. Update documentation in `README.md`
5. Add examples

### Adding a New Report Format

1. Create generator method in `report-generator.ts`
2. Update CLI options in `index.ts`
3. Add documentation and examples
4. Update `package.json` scripts if needed

## Documentation

When adding features:
- Update README.md
- Add JSDoc comments to functions
- Include usage examples
- Update QUICKSTART.md if relevant

## Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance

Examples:
```
feat(metrics): add code churn calculation

Implement code churn metric to track files changed frequently.
This helps identify areas with high technical debt.

Closes #42

fix(api): handle GitHub rate limiting gracefully

Add exponential backoff when rate limit is reached.
Display clear message to user about waiting period.

docs(readme): add troubleshooting section

Include common errors and solutions for setup issues.
```

## Release Process

Maintainers will:
1. Review and merge PRs
2. Update version in `package.json`
3. Update CHANGELOG.md
4. Create release tag
5. Publish to npm (if applicable)

## Questions?

- Open an issue with the `question` label
- Check existing issues and discussions
- Review documentation

Thank you for contributing! 🎉
