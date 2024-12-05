import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { fixupPluginRules } from '@eslint/compat'
import { FlatCompat } from '@eslint/eslintrc'
import js from '@eslint/js'
import _import from 'eslint-plugin-import'
import prettier from 'eslint-plugin-prettier'
import promise from 'eslint-plugin-promise'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import unusedImports from 'eslint-plugin-unused-imports'
import parser from 'jsonc-eslint-parser'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
})

export default [
  ...compat.extends('prettier'),
  {
    plugins: {
      prettier,
      import: fixupPluginRules(_import),
      'simple-import-sort': simpleImportSort,
      'unused-imports': unusedImports,
    },

    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
  },
  {
    files: ['**/*.js'],

    languageOptions: {
      globals: {},
    },

    rules: {
      'space-before-function-paren': 0,
      'prettier/prettier': 'error',
      curly: 'error',

      'no-constant-condition': [
        'error',
        {
          checkLoops: false,
        },
      ],

      'unused-imports/no-unused-imports': 'error',
    },
  },
  {
    files: ['**/*.json'],

    languageOptions: {
      parser: parser,
    },

    rules: {},
  },
  {
    files: ['**/*.js'],

    rules: {
      'simple-import-sort/exports': 'error',

      'sort-imports': [
        'error',
        {
          ignoreCase: false,
          ignoreDeclarationSort: true,
          ignoreMemberSort: false,
          memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
          allowSeparatedGroups: false,
        },
      ],

      'import/order': [
        'error',
        {
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },

          'newlines-between': 'never',

          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'object',
            'type',
          ],

          pathGroups: [
            {
              pattern: '@minka/**',
              group: 'internal',
              position: 'before',
            },
          ],

          pathGroupsExcludedImportTypes: ['builtin', 'object'],
        },
      ],
    },
  },
  {
    files: ['**/*.js'],

    plugins: {
      promise,
    },

    rules: {
      'promise/catch-or-return': 'error',
      'promise/valid-params': 'error',
      'promise/prefer-await-to-then': 'warn',
      'promise/no-multiple-resolved': 'error',
    },
  },
]
