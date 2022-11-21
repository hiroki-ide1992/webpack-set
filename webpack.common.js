const path = require('path'); //Nodeのpathモジュールの使用
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const WebpackWatchedGlobEntries = require('webpack-watched-glob-entries-plugin');
const { htmlWebpackPluginTemplateCustomizer } = require('template-ejs-loader');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { webpack } = require('webpack');
const { ProvidePlugin } = require('webpack');

/* entryに追加するJSファイルをglogで指定している */
const entries = WebpackWatchedGlobEntries.getEntries([path.resolve(__dirname, './src/js/**/*.js')], {
  /* globから除外するファイルの指定 */
  ignore: path.resolve(__dirname, './src/js/**/_*.js'),
})();
/* entryに追加するJSファイルをglogで指定している */
const scssEntries = WebpackWatchedGlobEntries.getEntries([path.resolve(__dirname, './src/scss/**/*.scss')], {
  /* globから除外するファイルの指定 */
  ignore: path.resolve(__dirname, './src/scss/**/_*.scss'),
})();

/* src/html/配下にあるファイルをglogで全て指定している */
const htmlEntries = WebpackWatchedGlobEntries.getEntries([path.resolve(__dirname, './src/html/**.ejs')])();

/* HtmlWebpackPluginに動的に追加する為の処理 */
const htmlGlobPlugins = (htmlEntries, srcPath) => {
  return Object.keys(htmlEntries).map(
    (key) =>
      new HtmlWebpackPlugin({
        filename: `${key}.html`,
        template: htmlWebpackPluginTemplateCustomizer({
          htmlLoaderOption: {
            //ファイル自動読み込みと圧縮を無効化
            sources: false,
            minimize: false,
          },
          templatePath: `${srcPath}/${key}.ejs`,
        }),
        //ファイル自動出力と圧縮を無効化
        inject: false,
        minify: false,
      }),
  );
};
module.exports = {
  entry: entries,
  output: {
    path: path.resolve(__dirname, 'public'), //出力されるファイル先の設定
    filename: 'assets/js/[name].js', //出力されるファイル名
    chunkFilename: 'assets/js/[name].js', //entryポイント以外から出力されるjsファイルに対してこちらの設定で出力する(splitChunksで分割したファイルなど)
  },
  optimization: {
    splitChunks: {
      chunks: 'initial',
      cacheGroups: {
        vendor: {
          test: /node_modules/,
          name: 'vendor',
        },
      },
    },
  },
  module: {
    //利用するローダーの設定
    rules: [
      {
        test: /\.js?$/, //ローダーが適用するファイルの条件
        exclude: /node_modules/, //node_modules内のファイルをローダーの対象外に
        use: [
          //利用するローダー
          'babel-loader',
        ],
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: { url: false },
          },
          'postcss-loader',
          'sass-loader',
          'import-glob-loader',
        ],
      },
      {
        test: /\.ejs$/,
        use: ['html-loader', 'template-ejs-loader'],
      },
    ],
  },
  resolve: {
    // 拡張子の省略を配列で指定
    extensions: ['.ts', '.tsx', '.js', '.json', '.png'],
  },
  plugins: [
    //プラグインの使用設定
    new CleanWebpackPlugin({}), //バンドルするたびにファイル内を一旦削除する
    ...htmlGlobPlugins(htmlEntries, './src/html'),
    new MiniCssExtractPlugin({
      filename: './assets/css/[name].css', //出力されるファイル名
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: `${__dirname}/src/img/`,
          to: `${__dirname}/public/assets/img/`,
        },
      ],
    }),
    new WebpackWatchedGlobEntries(),
    new ProvidePlugin({
      $: 'jquery',
    }),
  ],
};
