import babel from '@rollup/plugin-babel';
import nodeResolve from "@rollup/plugin-node-resolve";

export default {
    input: 'src/isMailFine.js',
    output: {
        file: 'dist/index.js',
        format: 'es'
    },
    plugins: [
        nodeResolve(),
        babel({ babelHelpers: 'bundled' })
    ]
};
