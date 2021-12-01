module.exports = {
  env: {
    /* (i) An environment provides predefined global variables */
    node: true, // Node.js global variables and Node.js scoping
    es2021: true, // Adds all ECMAScript 2021 globals and automatically sets the ecmaVersion parser option to 12
  },
  parserOptions: {
    ecmaVersion: 2021, // Allows for the parsing of modern ECMAScript features
    sourceType: "module", // Allow imports of code placed in ECMAScript modules
    ecmaFeatures: {
      /* (i) Which additional language features you'd like to use */
    },
  },
  plugins: [
    /* (i) Place to define plugins, normally there is no need for this as "extends" will automatically import the plugin */
  ],
  extends: [
    "eslint:recommended", // Rules recommended by ESLint (eslint)
    "plugin:node/recommended-module", // Additional ESLint's rules for Node.js specific to ES modules (eslint-plugin-node)
    "plugin:import/errors", // Recommended errors for import (eslint-plugin-import)
    "plugin:import/warnings", // Recommended warnings for import (eslint-plugin-import)
    "plugin:import/typescript", // Typescript support for the import rules (eslint-plugin-import)
    "plugin:promise/recommended", // Enforce best practices for JavaScript promises (eslint-plugin-promise)
    "plugin:prettier/recommended", // This will display Prettier errors as ESLint errors. (!) Make sure this is always the last configuration in the extends array. (eslint-plugin-prettier & eslint-config-prettier)
  ],
  /* (i) Apply TypeScript rules just to TypeScript files */
  overrides: [
    {
      files: ["*.ts", "*.tsx"],
      parser: "@typescript-eslint/parser", // Specifies the ESLint parser
      parserOptions: {
        tsconfigRootDir: __dirname, // Required by `@typescript-eslint/recommended-requiring-type-checking`
        project: ["./tsconfig.json"], // Required by `@typescript-eslint/recommended-requiring-type-checking`
      },
      extends: [
        "plugin:@typescript-eslint/recommended", // TypeScript rules (@typescript-eslint/eslint-plugin)
        "plugin:@typescript-eslint/recommended-requiring-type-checking", // Linting with Type Information. More info: https://git.io/JEDmJ (@typescript-eslint/eslint-plugin)
      ],
    },
  ],
  rules: {
    /* (i) Place to specify ESLint rules. Can be used to overwrite rules specified by the extended configs */

    // Define extensions that shouldn't be specified on import
    "import/extensions": [
      "error",
      "ignorePackages",
      {
        ts: "never",
      },
    ],

    // Enforce a convention in module import order
    "import/order": [
      "error",
      {
        alphabetize: {
          order: "asc",
        },
        // this is the default order except for added `internal` in the middle
        groups: [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index",
        ],
        "newlines-between": "never",
      },
    ],

    // Tell `eslint-plugin-node` that when import path does not exist,
    // it should check whether or not any of the [filename + try extension] file exists.
    "node/no-missing-import": [
      "error",
      {
        tryExtensions: [".js", ".ts", ".d.ts"],
      },
    ],
  },
};
