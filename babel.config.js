function getAliasesFromTsConfig() {
  const tsConfig = require('./tsconfig.json');
  const paths = tsConfig.compilerOptions.paths;
  let alias = {};
  Object.keys(paths).forEach(key => {
    alias[key] = `./${paths[key][0]}`;
  });

  alias['react-native-reanimated'] = 'react-native-reanimated/src/Animated';

  return alias;
}

module.exports = function(api) {
  api.cache(true);

  const plugins = [
    [
      'module-resolver',
      {
        alias: getAliasesFromTsConfig(),
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        root: ['./src'],
      },
    ],
    'babel-plugin-styled-components',
    'date-fns',
    'graphql-tag',
    ['lodash', { id: ['lodash', 'recompact'] }],
  ];

  const presets = [
    'module:metro-react-native-babel-preset',
    'module:react-native-dotenv',
  ];

  return {
    env: {
      development: {
        plugins: [
          ...plugins,
          [
            'transform-remove-console',
            { exclude: ['disableYellowBox', 'error', 'info', 'log'] },
          ],
          'react-native-reanimated/plugin',
        ],
        presets: presets,
      },
      production: {
        plugins: [
          ...plugins,
          '@babel/plugin-transform-runtime',
          '@babel/plugin-transform-react-inline-elements',
          ['transform-remove-console', { exclude: ['error'] }],
          'react-native-reanimated/plugin',
        ],
        presets: presets,
      },
    },
    plugins,
    presets,
  };
};
