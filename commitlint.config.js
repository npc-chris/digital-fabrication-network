module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // New feature
        'fix',      // Bug fix
        'docs',     // Documentation only
        'style',    // Formatting, missing semi-colons, etc (no logic change)
        'refactor', // Code refactoring (no feature or fix)
        'perf',     // Performance improvements
        'test',     // Adding or updating tests
        'chore',    // Build process, dependency updates, tooling
        'ci',       // CI/CD configuration changes
        'revert',   // Reverts a previous commit
      ],
    ],
    'subject-case': [0],
    'subject-empty': [2, 'never'],
    'subject-max-length': [2, 'always', 100],
    'body-max-line-length': [2, 'always', 100],
  },
};
