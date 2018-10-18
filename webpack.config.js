var webpack             = require('webpack');
var ExtractTextPlugin   = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin   = require('html-webpack-plugin');
const path              = require('path');
// 环境变量配置，dev / online
var WEBPACK_ENV         = process.env.WEBPACK_ENV || 'dev';

// 获取html-webpack-plugin参数的方法 
var getHtmlConfig = function(name, title){
    return {
        template    : './src/view/' + name + '.html',
        filename    : 'view/' + name + '.html',
        title       : title,
        inject      : true,
        hash        : true,
        chunks      : ['common', name]
    };
};
// webpack config
var config = {
    entry: {
        'common'            : ['./src/page/common/index.js'],
        'index'             : ['./src/page/index/index.js'],
        'login'             : ['./src/page/login/index.js'],
    },
    output: {
        path        :  path.resolve(__dirname, 'dist'),
        publicPath  : '/dist',
        filename    : 'js/[name].js'
    },
    externals : {
        'jquery' : 'window.jQuery'
    },
    optimization:{
        
        splitChunks: {
            chunks: "initial",
            cacheGroups: {
                common: {
                    name: 'common',
                    priority: 10,
                    reuseExistingChunk: true,
                    minChunks: 2,
                    enforce: true,
                }
            }
        }
    },
    module: {
        rules:[
                {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                        fallback: "style-loader",
                        use: "css-loader"
                    })
                },
                {
                test: /\.(png|jpg|gif|woff|svg|eot|ttf)$/,
                use: [
                      {
                        loader: 'url-loader',
                        options: {
                          limit: 100,
                          name:'resource/[name].[ext]'
                        }
                      }
                ]
                },
                {
                    test: /\.string$/,
                        use:[
                            {
                              loader: 'html-loader'  
                            }
                        ]
                        
                }
        ]
    },
    resolve : {
        alias : {
            node_modules    : __dirname + '/node_modules',
            util            : __dirname + '/src/util',
            page            : __dirname + '/src/page',
            service         : __dirname + '/src/services',
            image           : __dirname + '/src/image'
        }
    },
    devServer: {
      contentBase: '.'
    },
    plugins: [
        
        // 把css单独打包到文件里
        new ExtractTextPlugin("css/[name].css"),
        // html模板的处理
        new HtmlWebpackPlugin(getHtmlConfig('index', '首页')),
        new HtmlWebpackPlugin(getHtmlConfig('login', '登录')),
    ]
};



module.exports = config;