import * as rollup from 'rollup';
import typescript from '@rollup/plugin-typescript';
import copy from 'rollup-plugin-copy';

const config: rollup.RollupOptions[] = [
  {
    input: [ 'src/index.ts', 'src/program-example.ts', 'src/async-await-example.ts' ],
    output: [
      {
        dir: 'dist',
        format: 'esm',
        sourcemap: true,
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
      },
    ],
    plugins: [
      typescript({
        tsconfig: './tsconfig.json',
        noEmitOnError: true,
      }),
      copy({
        targets: [{ src: 'src/*.json', dest: 'dist' }],
        flatten: true,
      }),
    ],
    external: ['defectless', 'zod', 'fs', 'path'],
  },
];

export default config;
