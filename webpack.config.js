//htmlWebpackPlugin自动化生成项目中html页面
var htmlWebpackPlugin = require('html-webpack-plugin');
var path = require('path');
var webpack = require('webpack');
//全局变量检测生产环境
var ENV = process.env.NODE_ENV;


var PATHS = {
	app: path.join(__dirname, 'public/js/app/main'),
	dist: path.join(__dirname, 'public/js/dist')
};

var baseConfig = {
	entry: {
		app: PATHS.app,
	},
	output: {
		path: PATHS.dist,
		filename: 'bundle.js',
	},
	module: {
		rules: [{
			test: /\.css$/,
			use: [{
				loader: 'style-loader'
			}, {
				loader: 'css-loader'
			}]
		}, {
			test: /\.less$/,
			use: [{
				loader: 'style-loader'
			}, {
				loader: 'css-loader'
			}, {
				loader: 'less-loader'
			}]
		}, {
			//识别url，将png替换成base64
			test: /\.png$/,
			use: [{
				loader: 'url-loader',
				query: {
					limit: 10000,
					name: '../../img/[name]_[hash:7].[ext]'
				}
			}]
		}]
	},
	//插件（Plugins）是用来拓展Webpack功能的,插件并不直接操作单个文件，它直接对整个构建过程其作用。
	plugins: [
		//在脚本中加入变量
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify(ENV)
		}),
		//压缩
		new webpack.optimize.UglifyJsPlugin({
			sourceMap: false,
			mangle: false
		})
	]
};
//使用UglifyJS压缩
if (ENV === 'production') {
	// baseConfig.plugins.push(new webpack.optimize.UglifyJsPlugin({sourceMap: false,mangle: false}));
}
module.exports = baseConfig