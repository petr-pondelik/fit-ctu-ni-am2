const http2 = require('http2');
const fs = require('fs');

const SERVER_PORT = 8080;

const server = http2.createSecureServer({
    key: fs.readFileSync('./cert/localhost-privkey.pem'),
    cert: fs.readFileSync('./cert/localhost-cert.pem')
});

const INDEX_PATH = 'public/index.html';

function getExtension(filename) {
    let pattern = /\.[0-9a-z]{1,5}$/i;
    return filename.match(pattern)[0];
}

function responseHeaders(ext) {
    switch (ext) {
        case '.css':
            return {
                'content-type': 'text/css',
                ':status': 200
            };
        case '.js':
            return {
                'content-type': 'application/javascript',
                ':status': 200
            };
        case '.svg':
            return {
                'content-type': 'image/svg+xml',
                ':status': 200
            };
        default:
            return {
                'content-type': 'text/html',
                ':status': 200
            };
    }
}

server.on('error', (err) => console.error(err));

server.on('stream', (stream, headers) => {

    console.log('public' + headers[':path']);

    headers[':path'] = '/index.html';

    try {
        stream.respond(responseHeaders(getExtension(headers[':path'])));
    } catch (e) {
        stream.respond({':status': 404});
        stream.end();
        return;
    }

    try {
        stream.end(fs.readFileSync(INDEX_PATH));
    } catch (e) {
        stream.respond({':status': 404});
        stream.end();
    }

});

server.listen(SERVER_PORT, () => {
    console.log(`Running on https://127.0.0.1:${SERVER_PORT}/`)
});
