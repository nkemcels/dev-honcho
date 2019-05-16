const path = require("path")
module.exports={
    devtool:"source-map",
    entry: path.join(__dirname, "..", "app", "src", "index.js"),
    output: {
        path: path.join(__dirname, "..", "app", "dist"),
        filename: "bundle.js"
    },
    module:{
        rules:[
            {
                test:/\.(js|jsx)$/,
                exclude: /node_modules/,
                loader: "babel-loader"
            },
            {
                test: /\.(css|scss)$/,
                exclude: /node_modules/,
                loaders: ["style-loader", "css-loader"]
            },
            {
                test: /\.(png|jpg)/,
                loader:"file-loader"
            }
        ]
    },
    target: "electron-renderer"
}