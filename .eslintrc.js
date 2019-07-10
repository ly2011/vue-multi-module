// http://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parserOptions: {
    "parser": "babel-eslint",
    ecmaVersion: 7,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  globals: {
    axios: false
  },
  env: {
    browser: true,
    node: true,
    es6: true
  },
  /* global axios:false, var2:false */
  // https://github.com/standard/standard/blob/master/docs/RULES-en.md
  extends: ['plugin:vue/essential', 'eslint:recommended'],
  // required to lint *.vue files
  plugins: ['vue'],
  // add your custom rules here
  rules: {
    'no-console': 'off',
    'semi': [2, 'never']
  }
}
