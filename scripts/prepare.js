#!/usr/bin/env node
// Skip husky install in CI, production, or cloud hosting environments (Render, Vercel, Netlify, etc.)
const isCI =
  Boolean(process.env.CI) ||
  Boolean(process.env.RENDER) ||
  Boolean(process.env.VERCEL) ||
  Boolean(process.env.NETLIFY) ||
  process.env.NODE_ENV === 'production';

if (!isCI) {
  try {
    const { execSync } = require('child_process');
    execSync('husky install', { stdio: 'inherit' });
  } catch (error) {
    // If husky is not installed or fails, do not break the install/build process
    console.warn('Husky installation skipped or failed:', error.message);
  }
}
