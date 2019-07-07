// http://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
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
    browser: true
  },
  /* global axios:false, var2:false */
  // https://github.com/standard/standard/blob/master/docs/RULES-en.md
  extends: ['standard', 'plugin:flowtype/recommended'],
  // required to lint *.vue files
  plugins: ['html', 'flowtype'],
  // add your custom rules here
  rules: {
    semi: 0,
    'no-useless-escape': 0,
    // allow paren-less arrow functions
    'arrow-parens': 0,
    // allow async-await
    'generator-star-spacing': 0,
    // allow debugger during development
    'no-debugger': 0,
    'space-before-function-paren': 0
  }
}
