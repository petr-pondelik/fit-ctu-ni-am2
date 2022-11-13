const http = require("http");

// Server hostname
const HOSTNAME = '0.0.0.0';

// Server port
const PORT = 8080;

http.createServer((req, res) => {

    // Init the body to get the data asynchronously
    req.body = "";

    // Get the data of the body
    req.on('data', (chunk) => {
        req.body = chunk;
    });

    req.on('end', () => {
        let id;
        // Check the URL format
        if ((id = req.url.match("^/([a-zA-Z]+)$"))) {
            // Check the HTTP method
            if (req.method === 'GET') {
                // Return 200 response with the required data
                res.writeHead(200, {'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*'});
                res.end(`Hello ${id[1]}`);
            } else {
                res.writeHead(405, {'Access-Control-Allow-Origin': '*'});
                res.end();
            }
        } else {
            res.writeHead(404, {'Access-Control-Allow-Origin': '*'});
            res.end();
        }
    });

}).listen(PORT, HOSTNAME, () => {
    console.log(`Server running at http://${HOSTNAME}:${PORT}/`);
});