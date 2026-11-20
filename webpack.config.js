/* eslint-disable no-undef */

const fs = require("fs");
const path = require("path");
const webpack = require("webpack");
const devCerts = require("office-addin-dev-certs");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

async function getHttpsOptions() {
  const httpsOptions = await devCerts.getHttpsServerOptions();
  return { ca: httpsOptions.ca, key: httpsOptions.key, cert: httpsOptions.cert };
}

/** Dev-only endpoint for the end-to-end self test: stores results in test-results/. */
function selftestMiddleware(app) {
  app.post("/selftest/report", (req, res) => {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      try {
        const data = JSON.parse(body);
        const id = String(data.runId || "unknown").replace(/[^\w.-]/g, "_");
        const dir = path.join(__dirname, "test-results");
        fs.mkdirSync(dir, { recursive: true });
        const file = data.done ? `selftest-${id}.json` : `selftest-${id}.progress.json`;
        fs.writeFileSync(path.join(dir, file), JSON.stringify(data, null, 2));
        res.status(204).end();
      } catch (e) {
        res.status(400).send(String(e));
      }
    });
  });
}

module.exports = async (env, options) => {
  const dev = options.mode === "development";
  const config = {
    devtool: dev ? "source-map" : false,
    entry: {
      taskpane: ["./src/taskpane/taskpane.ts", "./src/taskpane/taskpane.html"],
      search: ["./src/dialog/search.ts", "./src/dialog/search.html"],
      commands: "./src/commands/commands.ts",
    },
    output: {
      clean: true,
      filename: dev ? "[name].js" : "[name].[contenthash:8].js",
      chunkFilename: dev ? "[name].chunk.js" : "[name].[contenthash:8].chunk.js",
    },
    resolve: {
      extensions: [".ts", ".html", ".js"],
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          use: { loader: "babel-loader" },
        },
        {
          test: /\.html$/,
          exclude: /node_modules/,
          use: "html-loader",
        },
        {
          test: /\.css$/,
          use: [MiniCssExtractPlugin.loader, "css-loader"],
        },
        {
          test: /\.(png|jpg|jpeg|gif|ico)$/,
          type: "asset/resource",
          generator: { filename: "assets/[name][ext][query]" },
        },
      ],
    },
    plugins: [
      new webpack.DefinePlugin({
        __SELFTEST__: JSON.stringify(dev),
      }),
      new MiniCssExtractPlugin({ filename: dev ? "[name].css" : "[name].[contenthash:8].css" }),
      new HtmlWebpackPlugin({
        filename: "taskpane.html",
        template: "./src/taskpane/taskpane.html",
        chunks: ["taskpane"],
      }),
      new HtmlWebpackPlugin({
        filename: "search.html",
        template: "./src/dialog/search.html",
        chunks: ["search"],
      }),
      new HtmlWebpackPlugin({
        filename: "commands.html",
        template: "./src/commands/commands.html",
        chunks: ["commands"],
      }),
      new CopyWebpackPlugin({
        patterns: [
          { from: "assets/*.png", to: "assets/[name][ext]" },
          { from: "assets/library", to: "assets/library" },
          { from: "src/help.html", to: "help.html" },
          { from: "src/index.html", to: "index.html" },
          // dev build: dev manifest; prod build: generated prod manifest (scripts/gen-manifest.js)
          { from: dev ? "manifest.dev.xml" : "manifest.xml", to: "manifest.xml" },
          { from: ".nojekyll", to: ".", noErrorOnMissing: true },
        ],
      }),
    ],
    performance: { hints: false },
    devServer: {
      headers: { "Access-Control-Allow-Origin": "*" },
      static: false,
      server: {
        type: "https",
        options: env.WEBPACK_BUILD || options.https !== undefined ? options.https : await getHttpsOptions(),
      },
      port: process.env.npm_package_config_dev_server_port || 3000,
      setupMiddlewares: (middlewares, devServer) => {
        selftestMiddleware(devServer.app);
        return middlewares;
      },
    },
  };
  return config;
};
