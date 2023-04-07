module.exports = {
  env: {
    es6: true,
    browser: false,
    node: true,
  },
  globals: {
    app: false,
    logger: false,
    redisClient: false,
  },
  extends: ['airbnb', 'prettier'],
  plugins: ['babel', 'import'],
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
  },
  rules: {
    'linebreak-style': 'off', // Неправильно работает в Windows.
    'operator-linebreak': 'off', // Несовместимо с prettier
    'no-underscore-dangle': [2, { allow: ['_id'] }],
    'no-console': 'off',

    'arrow-parens': 'off', // Несовместимо с prettier
    'object-curly-newline': 'off', // Несовместимо с prettier
    'no-mixed-operators': 'off', // Несовместимо с prettier
    'arrow-body-style': 'off', // Это - не наш стиль?
    'function-paren-newline': 'off', // Несовместимо с prettier
    'no-plusplus': 'off',
    'space-before-function-paren': 0, // Несовместимо с prettier

    'max-len': 'off', // airbnb позволяет некоторые пограничные случаи
    'no-alert': 'error', // airbnb использует предупреждение

    'no-param-reassign': 'off', // Это - не наш стиль?
    radix: 'warn', // parseInt, parseFloat и radix выключены. Мне это не нравится.

    'prefer-destructuring': 'off',
  },
};
