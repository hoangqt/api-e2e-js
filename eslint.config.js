import globals from "globals";

export default [
  {
    files: ["**/*.{js,ts}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.jest,
        ...globals.node,
        ...globals.browser
      },
    },
    rules: {
      "no-constant-condition": "off",
      "no-useless-escape": "off"
    },
  },
];
