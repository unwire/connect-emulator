"use strict";

const path = require("path");
const webpack = require("webpack");
const ExtractTextPlugin = require("extract-text-webpack-plugin");

const plugins = [
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.DefinePlugin({
        env: process.env,
        utils: require(path.join(__dirname, "app", "src", "js", "core", "utils.js")),
    }),
    new ExtractTextPlugin("styles.css")
];

// Uglify when production
if (process.env.NODE_ENV === "production") {
    plugins.push(new webpack.optimize.UglifyJsPlugin({
        compress: {
            warnings: false
        }
    }));
}

module.exports = {
    entry: {
        app: ['babel-polyfill', path.join(__dirname, "app", "src", "js", "main.js")],
    },
    output: {
        path: path.join(__dirname, "app", "lib"),
        filename: "[name].js",
        publicPath: "./"
    },
    plugins: plugins,
    module: {
        loaders: [{
            test: /\.js$/,
            exclude: /node_modules/,
            loader: "babel-loader",
            query: {
                "presets": [
                    "babel-preset-es2015",
                    "babel-preset-stage-0"
                ],
                "plugins": [
                    "transform-regenerator"
                ]
            }
        }, {
            test: /\.styl$/,
            loader: ExtractTextPlugin.extract({
                fallback: "style-loader",
                loader: ["css-loader", "stylus-loader"]
            })
        }, {
            test: /\.json$/,
            loader: "json-loader"
        }, {
            test: /\.pug/,
            loader: "pug-loader"
        }, {
            test: /\.(jpe?g|png|gif|svg|woff|woff2|eot|ttf)$/i,
            loaders: [
                "file-loader?hash=sha512&digest=hex&name=[hash].[ext]"
            ]
        }]
    }
};
