import babel from '@rollup/plugin-babel';

export default {
    input: 'src/isMailFine.js',
    output: {
        file: 'dist/index.js',
        format: 'cjs'
    },
    plugins: [
        babel({ babelHelpers: 'bundled' })
    ]
};
