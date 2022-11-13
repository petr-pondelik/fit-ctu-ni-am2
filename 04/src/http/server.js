const http = require("http");
const redis = require('redis');

// Server hostname
const HOSTNAME = '0.0.0.0';

// Server port
const PORT = 8080;

// Create redis client
const redisClient = redis.createClient('6379', 'redis');

// Redis client connected callback
redisClient.on('connect', () => {
    console.log('Redis client connected');
});

// Redis client connection error callback
redisClient.on('error', (err) => {
    console.log('Something went wrong ' + err);
});

// Fetch value by key from redis using redis-client get() method
function fetchFromRedis(key) {
    console.log('FETCH');
    return new Promise((resolve, reject) => {
        redisClient.get(key, (error, result) => {
            if (error) {
                console.log(error);
                reject(error);
            }
            console.log('GET result -> ' + result);
            resolve(result);
        });
    });
}

http.createServer((request, response) => {

    // Init the body to get the data asynchronously
    request.body = "";

    // Get the data of the body
    request.on('data', (chunk) => {
        request.body = chunk;
    });

    request.on('end', () => {
        let id;
        // Check the URL format
        if ((id = request.url.match("^/person/([a-zA-Z]+)/address$"))) {
            // Check the HTTP method
            if (request.method === 'GET') {
                fetchFromRedis(id[1])
                    .then((res) => {
                        if (res === null) {
                            // If the values was not found by key, return HTTP 404 Not Found
                            response.writeHead(404, {'Access-Control-Allow-Origin': '*'});
                            response.end();
                        } else {
                            // Return HTTP 200 OK with the requested data
                            response.writeHead(200, {'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*'});
                            response.end(res);
                        }
                    })
                    .catch((err) => {
                        // Return HTTP 500 Internal Server Error on unexpected error
                        response.writeHead(500, {'Access-Control-Allow-Origin': '*'});
                        response.end(err.message);
                    })
            } else {
                // Return HTTP 405 Method Not Allowed
                response.writeHead(405, {'Access-Control-Allow-Origin': '*'});
                response.end();
            }
        } else {
            // Return HTTP 404 Not Found when the URL was not matched
            response.writeHead(404, {'Access-Control-Allow-Origin': '*'});
            response.end();
        }
    });

}).listen(PORT, HOSTNAME, () => {
    console.log(`Server running at http://${HOSTNAME}:${PORT}/`);
});