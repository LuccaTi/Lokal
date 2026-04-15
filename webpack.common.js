import path from 'node:path';
import { fileURLToPath } from 'node:url';
import HtmlWebpackPlugin from 'html-webpack-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    entry: {
        home: './src/pages/home/home.entry.js',
        dashboard: './src/pages/dashboard/dashboard.entry.js'
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/pages/home/home.template.html',
            filename: 'index.html',
            chunks: ['home'],
        }),
        new HtmlWebpackPlugin({
            template: './src/pages/dashboard/dashboard.template.html',
            filename: 'dashboard.html',
            chunks: ['dashboard'],
        })
    ],
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.html$/i,
                use: ['html-loader'],
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
            },
        ],
    },
};