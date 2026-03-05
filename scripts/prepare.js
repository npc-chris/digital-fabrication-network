#!/usr/bin/env node
// Skip husky install in CI environments (Vercel, GitHub Actions, etc.)
if (!process.env.CI) {
  const { execSync } = require('child_process');
  execSync('husky install', { stdio: 'inherit' });
}
