const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");

const outputPath = path.resolve(__dirname, "out/apidoc");

module.exports = {
  mode: "development",
  entry: {
    app: require.resolve("./swagger/index"),
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.yaml$/,
        use: [{ loader: "json-loader" }, { loader: "yaml-loader" }],
      },
      {
        test: /\.css$/,
        use: [{ loader: "style-loader" }, { loader: "css-loader" }],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin([outputPath]),
    new HtmlWebpackPlugin({
      template: "swagger/index.html",
    }),
  ],
  output: {
    filename: "[name].bundle.js",
    path: outputPath,
  },
};
