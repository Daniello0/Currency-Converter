// eslint.config.js
import globals from 'globals';
import js from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';

export default [
    // Глобальные переменные для окружения (браузер, Node.js)
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
            },
            ecmaVersion: 'latest',
            sourceType: 'module',
        },
    },

    // Включаем рекомендованные правила ESLint
    js.configs.recommended,

    // Включаем конфигурацию Prettier. **ВАЖНО: всегда должна быть последней!**
    // Она отключает правила ESLint, которые конфликтуют с Prettier.
    prettierConfig,

    // Ваши собственные правила можно добавить здесь
    {
        rules: {
            'no-console': 'off', // Например, предупреждать о console.log, а не отключать
            'no-unused-vars': 'warn', // Предупреждать о неиспользуемых переменных
        },
    },
];
