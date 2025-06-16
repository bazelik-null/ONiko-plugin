import path from 'path';
import CopyPlugin from 'copy-webpack-plugin';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configuration = {
    mode: 'development',
    devtool: "cheap-module-source-map",
    entry: {
        background: path.join(__dirname, 'scripts', 'background.js'),
        options: path.join(__dirname, 'scripts', 'options.js'),
        content: path.join(__dirname, 'scripts', 'content.js'),
        projectiles: path.join(__dirname, 'scripts', 'projectiles.js'),
        health: path.join(__dirname, 'scripts', 'health.js')
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'scripts/[name].js',
        publicPath: ""
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            },
            {
                test: /\.js$/,
                exclude: /node_modules/
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
                { from: 'manifest.json', to: '' },
                { from: 'node_modules/webextension-polyfill/dist/browser-polyfill.js', to: 'lib' }
            ],
        }),
    ]
};

export default configuration;
