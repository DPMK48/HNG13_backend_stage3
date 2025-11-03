# Contributing to SummarizeBot

Thank you for considering contributing to SummarizeBot! This document provides guidelines for contributing to the project.

## How to Contribute

1. **Fork the repository**
2. **Create a new branch** for your feature or bugfix
3. **Make your changes** with clear, descriptive commit messages
4. **Add tests** for any new functionality
5. **Ensure all tests pass** by running `npm test`
6. **Submit a pull request** with a clear description of your changes

## Development Setup

```bash
# Clone your fork
git clone https://github.com/your-username/HNG_backend_stage3.git

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Add your OpenAI API key to .env

# Run in development mode
npm run dev
```

## Code Style

- Use TypeScript for all new code
- Follow the existing code style
- Run `npm run lint` before committing
- Run `npm run format` to auto-format code

## Testing

- Write tests for new features
- Ensure existing tests still pass
- Aim for good test coverage
- Test both success and error cases

## Pull Request Guidelines

- Keep PRs focused on a single feature or fix
- Update documentation if needed
- Add tests for new functionality
- Ensure CI passes
- Respond to review feedback promptly

## Reporting Issues

- Use the GitHub issue tracker
- Include clear steps to reproduce
- Provide error messages and logs
- Specify your environment (OS, Node version, etc.)

## Questions?

Feel free to reach out to dorathypaul48@gmail.com

Thank you for your contributions! 🙏
