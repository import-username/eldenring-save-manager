const path = require("path");

const entryPath = path.join(__dirname, "src", "main");
const outPath = path.join(__dirname, "build");

module.exports = [
    {
        entry: path.join(entryPath, "main.js"),
        target: "electron-main",
        output: {
            filename: "main.js",
            path: outPath
        }
    },
    {
        entry: path.join(entryPath, "preload.js"),
        target: "electron-preload",
        output: {
            filename: "preload.js",
            path: outPath
        }
    }
];
