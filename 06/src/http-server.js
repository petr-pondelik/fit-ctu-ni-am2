const http = require("http");
const fs = require('fs');

// Server hostname
const HOSTNAME = '127.0.0.1';

// Server port
const PORT = 8080;

const INDEX_PATH = 'public/index.html';

function getExtension(filename) {
    let pattern = /\.[0-9a-z]{1,5}$/i;
    return filename.match(pattern)[0];
}

function responseHeaders(ext) {
    switch (ext) {
        case '.css':    return { 'Content-Type': 'text/css' };
        case '.js':     return { 'Content-Type': 'application/javascript' };
        case '.svg':    return { 'Content-Type': 'image/svg+xml' };
        default:        return { 'Content-Type': 'text/html' };
    }
}

http.createServer((req, res) => {

    // Init the body to get the data asynchronously
    req.body = "";

    // Get the data of the body
    req.on('data', (chunk) => {
        req.body = chunk;
    });

    req.on('end', () => {

        console.log(req.url);

        if (req.url === '/') {
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end(fs.readFileSync(INDEX_PATH));
        } else {
            let data;
            try {
                data = fs.readFileSync('.' + req.url);
            } catch (e) {
                res.writeHead(404);
                res.end();
                return;
            }
            res.writeHead(200, responseHeaders(getExtension(req.url)));
            res.end(data);
        }

        res.end();

    });

}).listen(PORT, HOSTNAME, () => {
    console.log(`Server running at http://${HOSTNAME}:${PORT}/`);
});