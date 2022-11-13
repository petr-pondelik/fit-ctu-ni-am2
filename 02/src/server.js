const http = require('http');
const url = require("url");
const path = require("path");
const fs = require("fs");

const hostname = '127.0.0.1';
const port = 8080;
const wd = process.cwd();

// Error wrapper class
class Error {
    constructor(code, msg = null) {
        this.code = code;
        this.msg = msg;
    }
}

// FileSystem logic
let ServeStatic = {

    // Asynchronous file existence check
    exists: (path) => {
        return new Promise((resolve, reject) => {
            fs.promises.access(path, fs.constants.F_OK)
                .then(() => resolve(true))
                .catch(() => reject(new Error(404, "Not found")))
        });
    },

    // Read file content asynchronously
    readContent: (path) => {
        return new Promise((resolve, reject) => {
            fs.promises.readFile(path, "binary")
                .then((data) => resolve(data))
                .catch(() => reject(new Error(400, "Bad Request")))
        })
    }

}

http.createServer((req, res) => {

    // Set Access-Control-Allow-Origin header due to CORS
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Parse path to the requested file
    let pathName = url.parse(req.url).pathname;
    let filePath = path.join(wd, pathName);

    // Service homepage
    if (pathName === '/') {
        res.statusCode = 200;
        res.write('Node.JS download server', "utf-8");
        res.end();
    }

    // Return the requested file if it exists
    ServeStatic.exists(filePath)
        .then(() => { return ServeStatic.readContent(filePath) })
        .then((data) => {
            // If the file data was successfully read, return 200 response
            if (typeof data === 'string') {
                res.statusCode = 200;
                // Set response content type
                res.setHeader('Content-Type', 'application/json');
                // Set content length to allow tracking download progress on the client side
                res.setHeader('Content-Length', Buffer.byteLength(data, 'utf8'));
                res.write(data, "binary");
            }
            res.end();
        })
        .catch((err) => {
            // Return error response
            res.statusCode = err.code;
            res.statusMessage = err.message;
            res.end();
        });

}).listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});