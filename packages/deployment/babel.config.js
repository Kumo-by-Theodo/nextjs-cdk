const defaultPresets = [['@babel/preset-typescript', { allowNamespaces: true }]];

const defaultIgnores = [/.*\/(.*\.|)test\.tsx?/, /node_modules/, /dist/, /cdk.out/];

const defaultPlugins = ['tsconfig-paths-module-resolver', '@babel/plugin-transform-runtime'];

const presetsForESM = [
  [
    '@babel/preset-env',
    {
      modules: false,
    },
  ],
  ...defaultPresets,
];
const presetsForCJS = [
  [
    '@babel/preset-env',
    {
      modules: 'cjs',
    },
  ],
  ...defaultPresets,
];

module.exports = {
  env: {
    cjs: {
      presets: [...presetsForCJS],
    },
    esm: {
      presets: [...presetsForESM],
    },
  },
  ignore: defaultIgnores,
  plugins: [...defaultPlugins],
};
