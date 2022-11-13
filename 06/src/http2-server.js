const http2 = require('http2');
const fs = require('fs');

const SERVER_PORT = 8443;

const server = http2.createSecureServer({
    key: fs.readFileSync('./cert/localhost-privkey.pem'),
    cert: fs.readFileSync('./cert/localhost-cert.pem')
});

const INDEX_PATH = 'public/index.html';

const ASSETS = [
    'public/assets/materialize/css/materialize.css',
    'public/assets/materialize/js/materialize.js',
    'public/assets/static/http2.svg'
];

const ASSETS_2 = [
    'public/assets/static/mystylesheet.css',
    'public/assets/static/myscript.js',
    'public/assets/static/http2.svg'
];

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

    if (headers[':path'] === '/') {

        headers[':path'] = '/index.html';

        try {
            stream.respond(responseHeaders(getExtension(headers[':path'])));
        } catch (e) {
            stream.respond({ ':status': 404 });
            stream.end();
            return;
        }

        for (const asset of ASSETS) {
        // for (const asset of ASSETS_2) {
                stream.pushStream({':path': '/' + asset}, (err, pushStream, headers) => {
                    if (err) { throw err }
                    pushStream.respond(responseHeaders(getExtension(asset)));
                    pushStream.end(fs.readFileSync(asset));
                });
        }

        try {
            stream.end(fs.readFileSync(INDEX_PATH));
        } catch (e) {
            stream.respond({ ':status': 404 });
            stream.end();
        }

    } else {
        stream.respond({ ':status': 404 });
        stream.end();
    }

});

server.listen(SERVER_PORT, () => {console.log(`Running on https://127.0.0.1:${SERVER_PORT}/`)});
