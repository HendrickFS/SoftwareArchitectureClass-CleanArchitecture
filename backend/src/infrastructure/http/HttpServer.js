/**
 * ============================================================================
 * CAMADA 4: INFRASTRUCTURE (Frameworks & Drivers - Web Server)
 * Arquivo: HttpServer.js
 * ============================================================================
 *
 * CONCEITO ARQUITETURAL: A WEB É UM DETALHE DE ENTREGA (DELIVERY MECHANISM)
 * Este arquivo usa o módulo nativo `node:http` (poderia ser Express, Fastify ou NestJS).
 * Nenhuma regra de negócio mora aqui! Ele apenas escuta uma porta TCP, lê o JSON
 * da rede e repassa para o `EcommerceHttpController` (Camada 3).
 *
 * Também incluímos um servidor de arquivos estáticos para entregar a pasta `frontend/`
 * na mesma porta (http://localhost:3000), facilitando a apresentação sem precisar
 * subir dois terminais ou configurar bundlers complexos.
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FRONTEND_DIR = path.resolve(__dirname, '../../../../frontend');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
};

export class HttpServer {
  /**
   * @param {import('../../adapters/controllers/EcommerceHttpController.js').EcommerceHttpController} controller
   */
  constructor(controller) {
    this.controller = controller;
  }

  start(port = 3000) {
    const server = http.createServer(async (req, res) => {
      // Habilita CORS caso o aluno abra o frontend usando Live Server em outra porta
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

      if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
      }

      // Rotas da API REST (Backend)
      if (req.url === '/api/products' && req.method === 'GET') {
        const response = await this.controller.handleListProducts();
        return this.sendJson(res, response.statusCode, response.body);
      }

      if (req.url === '/api/checkout' && req.method === 'POST') {
        const body = await this.parseJsonBody(req);
        const response = await this.controller.handleCheckout(body);
        return this.sendJson(res, response.statusCode, response.body);
      }

      // Entrega dos arquivos da pasta `frontend/` no navegador
      this.serveFrontendStaticFile(req, res);
    });

    server.listen(port, () => {
      console.log('======================================================================');
      console.log('🏛️  E-COMMERCE CLEAN ARCHITECTURE INICIADO COM SUCESSO!');
      console.log(`🌐 Frontend + API rodando em: http://localhost:${port}`);
      console.log(`📦 Endpoint Catálogo (GET):   http://localhost:${port}/api/products`);
      console.log(`💳 Endpoint Checkout (POST):  http://localhost:${port}/api/checkout`);
      console.log('======================================================================');
    });

    return server;
  }

  sendJson(res, statusCode, payload) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(payload, null, 2));
  }

  parseJsonBody(req) {
    return new Promise((resolve) => {
      let rawData = '';
      req.on('data', (chunk) => {
        rawData += chunk;
      });
      req.on('end', () => {
        try {
          resolve(rawData ? JSON.parse(rawData) : {});
        } catch {
          resolve({});
        }
      });
    });
  }

  serveFrontendStaticFile(req, res) {
    const cleanUrl = req.url === '/' ? '/index.html' : req.url.split('?')[0];
    const filePath = path.join(FRONTEND_DIR, cleanUrl);

    // Proteção contra Path Traversal
    if (!filePath.startsWith(FRONTEND_DIR)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Arquivo não encontrado.');
        return;
      }
      const ext = path.extname(filePath);
      const contentType = MIME_TYPES[ext] || 'text/plain; charset=utf-8';
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    });
  }
}
