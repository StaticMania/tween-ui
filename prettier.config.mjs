/**
 * Root formatting rules, applied to files outside the workspaces.
 *
 * `apps/docs` keeps its own `.prettierrc.json` because it adds the import-sort
 * and Tailwind class-sort plugins, which are dependencies of that workspace
 * rather than the root. The shared options below are kept identical to it.
 *
 * @type {import('prettier').Config}
 */
const config = {
  semi: true,
  singleQuote: true,
  trailingComma: 'es5',
  printWidth: 100,
  tabWidth: 2,
  endOfLine: 'lf',
};

export default config;
