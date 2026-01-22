const { createServer: createHttpsServer } = require('https');
const { createServer: createHttpServer } = require('http');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const httpsOptions = {
    key: fs.readFileSync(path.join(__dirname, 'cloudflare_00.key')),
    cert: fs.readFileSync(path.join(__dirname, 'cloudflare_bundle_00.pem')),
};

app.prepare().then(() => {
    // 1. 启动 HTTPS 服务 (443)
    createHttpsServer(httpsOptions, (req, res) => {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
    }).listen(443, (err) => {
        if (err) throw err;
        console.log('> HTTPS Ready on https://localhost:443');
    });

    // 2. 启动 HTTP 服务 (80) 用于自动跳转到 HTTPS
    createHttpServer((req, res) => {
        const host = req.headers['host'];
        res.writeHead(301, { "Location": `https://${host}${req.url}` });
        res.end();
    }).listen(80, (err) => {
        if (err) throw err;
        console.log('> HTTP Ready on http://localhost:80 (Redirecting to HTTPS)');
    });
});
