import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'
import vueParser from 'vue-eslint-parser'                 // +++
import tsParser from '@typescript-eslint/parser'          // +++
import tsPlugin from '@typescript-eslint/eslint-plugin'   // +++

export default defineConfig([
  {
    name: 'app/files-to-lint',
    files: ['**/*.{js,mjs,jsx,vue,ts,tsx}'],
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },

  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  skipFormatting,
    // Tell ESLint how to parse <script setup lang="ts"> in .vue
    {
        files: ['**/*.vue'],
        languageOptions: {
            parser: vueParser,
            parserOptions: {
                parser: tsParser,                                  // use TS inside <script>
                ecmaVersion: 'latest',
                sourceType: 'module',
                extraFileExtensions: ['.vue'],
            },
            globals: { ...globals.browser },
        },
        plugins: { '@typescript-eslint': tsPlugin },
        rules: {
            'vue/script-setup-uses-vars': 'error',
        },
    },

    // Parse standalone .ts/.tsx files with TS parser (optional but nice)
    {
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            parser: tsParser,
            parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
        },
        plugins: { '@typescript-eslint': tsPlugin },
    },
])
