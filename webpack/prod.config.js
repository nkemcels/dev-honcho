const path = require("path")
// const mainEntryKey = path.join(__dirname, "..", "app", "src", "index");
// const secondEntryKey = path.join(__dirname, "..", "app", "src", "newServerIndex");
module.exports={
    devtool:"source-map",
    entry:{
        mainBundle: path.join(__dirname, "..", "app", "src", "index.js"),
        newServerBundle: path.join(__dirname, "..", "app", "src", "newServerIndex.js"),
        newAppBundle: path.join(__dirname, "..", "app", "src", "newAppIndex.js")
    }, 
    output: {
        path: path.join(__dirname, "..", "app", "dist"),
        filename: "[name].js"
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