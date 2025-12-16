# Security Policy

## Our Commitment

Word of the Day is committed to maintaining security and privacy. We collect **zero data** from users, and we want to ensure the codebase remains secure for everyone.

## Supported Versions

We support the latest version of the project. Security updates will be applied to the `master` branch.

| Version | Supported          |
| ------- | ------------------ |
| Latest  | :white_check_mark: |
| Older   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

### DO NOT
- Open a public GitHub issue for security vulnerabilities
- Disclose the vulnerability publicly before it's been addressed

### DO
1. **Email** the maintainer directly (add your email here)
2. **Provide details** including:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if you have one)

### What to Expect
- **Acknowledgment**: Within 48 hours
- **Updates**: We'll keep you informed of progress
- **Resolution**: We aim to address critical issues within 7 days
- **Credit**: With your permission, we'll credit you in the fix

## Security Considerations

### Static Site Architecture
This project is a **fully static website** hosted on AWS S3:
- No server-side code execution in production
- No user authentication or sessions
- No database or API endpoints
- No user data collection or storage

### Potential Risk Areas
1. **Malicious PRs**: We manually review all pull requests, especially:
   - Changes to `package.json` or dependencies
   - Modifications to `.tsx`, `.ts`, or configuration files
   - Large changes to `data/words.json`

2. **Content Injection**: All content from `words.json` is automatically escaped by React

3. **Infrastructure**: Terraform configurations and deployment scripts are carefully reviewed

## Best Practices for Contributors

When contributing:
- Keep PRs focused and small
- Don't modify dependencies without discussion
- Don't include personal information or credentials
- Follow the existing code patterns
- Run `npm run validate` before submitting

## Security Updates

Security fixes will be:
- Applied to the `master` branch immediately
- Documented in commit messages
- Announced in the repository (if appropriate)

## Questions?

For general security questions (not vulnerabilities), open a GitHub issue with the `security` label.

---

**Remember**: This site is privacy-first. We will never introduce analytics, tracking, or data collection.
