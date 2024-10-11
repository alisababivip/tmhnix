"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupApiDocsRoutes = void 0;
const fs_1 = __importDefault(require("fs"));
const setupApiDocsRoutes = (app) => {
    const rootPath = process.cwd();
    async function serveStaticFile(res, filePath, contentType) {
        try {
            const content = await fs_1.default.readFileSync(filePath, 'utf8');
            res.writeHeader('Content-Type', contentType);
            res.end(content);
        }
        catch (error) {
            res.writeStatus('404 Not Found');
            res.end('File not found');
        }
    }
    app.get('/docs/api.yaml', async (res) => {
        const content = await fs_1.default.readFileSync(`${rootPath}/api.yaml`, 'utf8');
        res.writeHeader('Content-Type', 'text/yaml');
        res.end(content);
    });
    app.get('/docs', (res) => {
        res.writeHeader('Content-Type', 'text/html');
        res.end(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>API Docs</title>
        <link rel="stylesheet" type="text/css" href="/docs/swagger-ui.css" />
        <link rel="stylesheet" type="text/css" href="/docs/index.css" />
        <link rel="icon" type="image/png" href="/docs/favicon-32x32.png" sizes="32x32" />
        <link rel="icon" type="image/png" href="/docs/favicon-16x16.png" sizes="16x16" />
      </head>

      <body>
        <div id="swagger-ui"></div>
        <script src="/docs/swagger-ui-bundle.js" charset="UTF-8"> </script>
        <script src="/docs/swagger-ui-standalone-preset.js" charset="UTF-8"> </script>
        <script src="/docs/swagger-initializer.js" charset="UTF-8"> </script>
      </body>
    </html>
    `);
    });
    app.get('/docs/swagger-initializer.js', async (res) => {
        try {
            const indexPath = require.resolve('swagger-ui-dist/swagger-initializer.js');
            let content = await fs_1.default.readFileSync(indexPath, 'utf8');
            content = content.replace('https://petstore.swagger.io/v2/swagger.json', `/docs/api.yaml`);
            res.writeHeader('Content-Type', 'text/html');
            res.end(content);
        }
        catch (error) {
            console.error(error);
            res.writeStatus('500 Internal Server Error');
            res.writeHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
                status: 'fail',
                error: error,
            }));
        }
    });
    app.get('/docs/swagger-ui.css', async (res) => {
        try {
            const indexPath = require.resolve('swagger-ui-dist/swagger-ui.css');
            let content = await fs_1.default.readFileSync(indexPath, 'utf8');
            content = content.replace('.swagger-ui .topbar{background-color:#1b1b1b;padding:10px 0}', `.swagger-ui .topbar{display:none;}`);
            res.writeHeader('Content-Type', 'text/css');
            res.end(content);
        }
        catch (error) {
            console.error(error);
            res.writeStatus('500 Internal Server Error');
            res.writeHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
                status: 'fail',
                error: error,
            }));
        }
    });
    app.get('/docs/swagger-ui-bundle.js', (res) => {
        const filePath = require.resolve('swagger-ui-dist/swagger-ui-bundle.js');
        serveStaticFile(res, filePath, 'text/javascript');
    });
    app.get('/docs/swagger-ui-standalone-preset.js', (res) => {
        const filePath = require.resolve('swagger-ui-dist/swagger-ui-standalone-preset.js');
        serveStaticFile(res, filePath, 'text/javascript');
    });
    app.get('/docs/favicon-32x32.png', (res) => {
        const filePath = require.resolve('swagger-ui-dist/favicon-32x32.png');
        serveStaticFile(res, filePath, 'image/png');
    });
    app.get('/docs/favicon-16x16.png', (res) => {
        const filePath = require.resolve('swagger-ui-dist/favicon-16x16.png');
        serveStaticFile(res, filePath, 'image/png');
    });
    app.get('/docs/index.css', (res) => {
        const filePath = require.resolve('swagger-ui-dist/index.css');
        serveStaticFile(res, filePath, 'text/css');
    });
};
exports.setupApiDocsRoutes = setupApiDocsRoutes;
