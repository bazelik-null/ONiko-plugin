import path from 'path';
import CopyPlugin from 'copy-webpack-plugin';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configuration = {
    mode: 'development',
    devtool: "cheap-module-source-map",
    entry: {
        background: path.join(__dirname, 'scripts', 'background.ts'),
        options: path.join(__dirname, 'scripts', 'options.ts'),
        content: path.join(__dirname, 'scripts', 'content.ts'),
        projectiles: path.join(__dirname, 'scripts', 'projectiles.ts'),
        health: path.join(__dirname, 'scripts', 'health.ts'),
        utils: path.join(__dirname, 'scripts', 'utils.ts'),
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'scripts/[name].js',
        publicPath: ""
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: {
                    loader: 'ts-loader',
                },
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env', '@babel/preset-typescript'],
                    },
                },
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: [
                    'file-loader',
                ],
            },
        ]
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: 'static', to: '' }, // Copy all assets and the manifest.json from 'static' to 'dist'
                { from: 'node_modules/webextension-polyfill/dist/browser-polyfill.js', to: 'lib' }
            ],
        }),
    ]
};

export default configuration;
