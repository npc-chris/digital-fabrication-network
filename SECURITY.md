# Security Policy

## Supported Versions

The following versions of this project are currently receiving security updates:

| Version | Supported          |
| ------- | ------------------ |
| latest  | :white_check_mark: |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

To report a security vulnerability, please use [GitHub Security Advisories](https://github.com/npc-chris/digital-fabrication-network/security/advisories/new). This allows us to assess and patch the issue before public disclosure.

### What to Include

When reporting a vulnerability, please include:

- A clear description of the vulnerability and its potential impact
- Steps to reproduce the issue
- Any proof-of-concept code or screenshots
- Suggested fix or mitigation (if known)

### Response Timeline

- **Acknowledgement:** Within 48 hours of submission
- **Initial assessment:** Within 5 business days
- **Resolution target:** Within 30 days for critical/high severity issues

### Disclosure Policy

We follow a responsible disclosure process:

1. Reporter submits vulnerability via GitHub Security Advisory
2. We acknowledge receipt and begin assessment
3. We develop and test a fix
4. We release the fix and publish a security advisory
5. Public disclosure occurs after the fix is released

## Security Best Practices for Contributors

- Never commit secrets, API keys, tokens, or credentials to the repository
- Use `.env` files (excluded via `.gitignore`) for all sensitive configuration
- All environment variable examples live in `.env.example` files with placeholder values only
- Dependencies are audited automatically via GitHub Dependabot and `npm audit`
- Follow the principle of least privilege for all API integrations
