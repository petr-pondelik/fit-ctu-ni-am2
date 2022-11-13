const http = require('http');

// Server hostname
const HOSTNAME = '127.0.0.1';

// Server port
const PORT = 8080;

const server = http.createServer((req, res) => {

    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*'
    });

    const connectionId = Date.now();
    console.log(`Connection ${connectionId} opened.`);

    const refreshRate = 1000; // ms
    let queueLen = 10;

    const interval = setInterval(() => {
        queueLen--;
        const data = {
            "status": 200,
            "data": `User ${Math.random().toString(36).substring(7)} subscribed for ${Math.floor((Math.random() * 10) + 1)} months.`
        };
        const message = `retry: ${refreshRate}\nid:${connectionId}\ndata: ${JSON.stringify(data)}\n\n`;
        res.write(message);
        if (queueLen <= 0) {
            clearInterval(interval);
        }
    }, refreshRate);

    req.on('close', () => {
        console.log(`Connection ${connectionId} closed.`);
    });

}).listen(PORT, HOSTNAME, () => {
    console.log(`Server running at http://${HOSTNAME}:${PORT}/`);
});
