"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.controllers = void 0;
const utils_1 = require("~~/utils");
const queries_1 = require("./queries");
const jsdom_1 = require("jsdom");
const node_fetch_1 = __importDefault(require("node-fetch"));
exports.controllers = {
    index: (0, utils_1.handleController)(async (_, __, ___, query) => {
        return (0, queries_1.getMessages)(query.ticket);
    }),
    send: (0, utils_1.handleController)(async (_, __, ___, ____, body, user) => {
        if (!user)
            throw new Error('User not found');
        return (0, queries_1.sendMessage)(user.id, body.ticket, body.message, body.isSupport);
    }),
    getMetadata: (0, utils_1.handleController)(async (_, __, ___, ____, body) => {
        try {
            const response = await (0, node_fetch_1.default)(body.url, {
                mode: 'cors',
            });
            const html = await response.text();
            const dom = new jsdom_1.JSDOM(html);
            const document = dom.window.document;
            const title = document.querySelector('head > title')?.textContent;
            const descriptionElement = document.querySelector('meta[name="description"]') ||
                document.querySelector('meta[property="og:description"]');
            const description = descriptionElement
                ? descriptionElement.getAttribute('content')
                : 'No description available';
            const imageElement = document.querySelector('meta[property="og:image"]');
            let image = imageElement ? imageElement.getAttribute('content') : null;
            if (!image) {
                const faviconElement = document.querySelector('link[rel="shortcut icon"]') ||
                    document.querySelector('link[rel="icon"]');
                image = faviconElement ? faviconElement.getAttribute('href') : null;
                if (image && !image.startsWith('http')) {
                    const parsedUrl = new URL(body.url);
                    image = parsedUrl.origin + image;
                }
            }
            if (!image) {
                image = '/img/placeholder.png';
            }
            return { title, description, image };
        }
        catch (error) {
            throw new Error('Error fetching metadata');
        }
    }),
};
