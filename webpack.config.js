const HtmlWebPackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
let isDev = true;

let config = () => ({
    output: {
        filename: '[name]-[chunkhash:8].js'
    },
    module: {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            },
            {
                test: /\.scss$/,
                use: cssOptions(true)
            },
            {
                test: /\.css$/,
                use: cssOptions()
            },
            {
                test: /\.(png|jp(e*)g|svg)$/,
                use: [{
                    loader: 'url-loader',
                    options: {
                        limit: 8000, // Convert images < 8kb to base64 strings
                        name: 'images/[hash]-[name].[ext]'
                    }
                }]
            },
            {
                test: /\.html$/,
                use: [
                    {
                        loader: "html-loader",
                        options: {minimize: true}
                    }
                ]
            },
            {
                test: /\.ejs$/,
                use: ['ejs-compiled-loader']
            }
        ]
    },
    plugins: [
        ...getHtmlPages(),
        new MiniCssExtractPlugin({
            filename: "[name]-[chunkhash:8].css",
            chunkFilename: "[id].css"
        })
    ]
})

module.exports = (env, options) => {
    isDev = options.mode === 'development'
    return config();
};

const cssnanoConfig = {
    preset: ['default', {
        discardComments: {
            removeAll: true,
        },
    }]
}

const cssOptions = (scss) => {
    const opt = [
        isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
        {loader: 'css-loader'},
        {
            loader: 'postcss-loader',
            options: {
                plugins: (loader) => {
                    if (!isDev) {
                        return [
                            require('autoprefixer')({browsers: ['last 3 versions', 'iOS 9']}),
                            require('cssnano')(cssnanoConfig)
                        ]
                    }
                }
            }
        }
    ];

    if (scss) {
        opt.push("sass-loader");
    }
    return opt;

}

const getHtmlPages = () => {
    const pages = [
        {
            src: 'index.ejs',
            name: 'index.html'
        },
        {
            src: 'about.ejs',
            name: 'about.html'
        }
    ];
    const baseOptions = {
        hash: true,
        minify: {
            removeComments: true,
            collapseWhitespace: true
        }
    };

    return pages.map(elem => {
        return new HtmlWebPackPlugin({
            template: `!!ejs-compiled-loader!./src/${elem.src}`,
            filename: `./${elem.name}`,
            ...baseOptions
        });
    });
}