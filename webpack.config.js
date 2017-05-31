"use strict";

const path = require("path");
const webpack = require("webpack");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const fs = require("fs");

function getEmulators (srcpath) {
  if (fs.existsSync(srcpath)){
    return fs.readdirSync(srcpath).
      filter(f => fs.lstatSync(path.join(srcpath, f)).isDirectory()).
      filter(f => fs.existsSync(path.join(srcpath, f , "index.js")));
  } else {
    return [];
  }
}

var internalEmulators = getEmulators(path.join(__dirname, "app", "src", "js", "emulators", "internal"));
var externalEmulators = getEmulators(path.join(__dirname, "app", "src", "js", "emulators", "external"));

var emulatorIndex = "";

for (var i in internalEmulators){
  emulatorIndex = emulatorIndex.concat(`\n  require("./internal/${internalEmulators[i]}"),`);
}

for (var i in externalEmulators){
  emulatorIndex = emulatorIndex.concat(`\n  require("./external/${externalEmulators[i]}"),`);
}

emulatorIndex = emulatorIndex.substring(0, emulatorIndex.length - 1); //remove last comma

fs.writeFileSync(path.join(__dirname, "app", "src", "js", "emulators", "index.js"), `module.exports = exports = [${emulatorIndex}\n];`);




const plugins = [
    new webpack.DefinePlugin({
        __WEBPACK__env: JSON.stringify(process.env)
    }),
    new ExtractTextPlugin("styles.css")
];




// Uglify when production
if (process.env.NODE_ENV !== "development") {
    plugins.push(new webpack.optimize.UglifyJsPlugin({
        compress: {
            warnings: false
        }
    }));
}

module.exports = {
    devtool: "source-map",
    entry: {
        app: ['babel-polyfill', path.join(__dirname, "app", "src", "js", "main.js")],
    },
    output: {
        path: path.join(__dirname, "app", "lib"),
        filename: "[name].js",
        publicPath: "./"
    },
    resolve: {
        alias: {
            core:      path.join(__dirname, "app", "src", "js", "core"),
            emulators: path.join(__dirname, "app", "src", "js", "emulators"),
            views:     path.join(__dirname, "app", "src", "js", "views"),
        },
        extensions: [`.${process.env.NODE_ENV}.js`, ".js"],
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
