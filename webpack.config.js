"use strict";

const path = require("path");
const webpack = require("webpack");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const fs = require("fs");
const GitRevisionPlugin = require('git-revision-webpack-plugin');

function getEmulators (srcpath) {
  if (fs.existsSync(srcpath)){
    return fs.readdirSync(srcpath).
      filter(f => fs.lstatSync(path.join(srcpath, f)).isDirectory()).
      filter(f => fs.existsSync(path.join(srcpath, f , "index.js")));
  } else {
    return [];
  }
}

var emulatorIndex = "";
var emulatorScope = ['internal', 'external'];
for(var i in emulatorScope){
  var scope = emulatorScope[i];
  var emulators = getEmulators(path.join(__dirname, "app", "src", "js", "emulators", scope));
  for (var j in emulators){
    emulatorIndex = emulatorIndex.concat(`require("./${scope}/${emulators[j]}"),`);
  }
}

fs.writeFileSync(path.join(__dirname, "app", "src", "js", "emulators", "index.js"), `module.exports = exports = [${emulatorIndex}\n];`);

var gitRevisionPlugin = new GitRevisionPlugin({
    lightweightTags: true
})

const plugins = [
    new webpack.DefinePlugin({
        __WEBPACK__env: JSON.stringify(process.env),
        __VERSION__: JSON.stringify(gitRevisionPlugin.version())
    }),
    new ExtractTextPlugin("styles.css"),
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
