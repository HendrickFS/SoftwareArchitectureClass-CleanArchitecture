/**
 * ============================================================================
 * COMPOSITION ROOT (Raiz de Composição / Ponto de Montagem)
 * Arquivo: main.js
 * ============================================================================
 *
 * CONCEITO ARQUITETURAL: QUEM CONECTA AS PEÇAS?
 * Uma dúvida muito comum em apresentações de Clean Architecture é:
 * "Se o Caso de Uso não pode dar `new InMemoryProductRepository()`, quem dá?"
 *
 * Resposta: O `main.js` (Composition Root)!
 * Ele é o componente mais externo do sistema ("sujo" por natureza), pois conhece
 * todas as camadas e faz a Injeção de Dependências (DI) manual.
 *
 * Se amanhã trocarmos o banco em memória por PostgreSQL, este é o ÚNICO arquivo
 * existente que precisará ter uma linha alterada!
 */

import { InMemoryProductRepository, InMemoryOrderRepository } from './infrastructure/database/InMemoryDatabase.js';
import { FakePaymentGateway } from './adapters/gateways/FakePaymentGateway.js';
import { ListProductsUseCase } from './application/use-cases/ListProductsUseCase.js';
import { CheckoutOrderUseCase } from './application/use-cases/CheckoutOrderUseCase.js';
import { EcommerceHttpController } from './adapters/controllers/EcommerceHttpController.js';
import { HttpServer } from './infrastructure/http/HttpServer.js';

// 1. Instanciar Infraestrutura e Adapters Secundários (Driven Adapters / Saída)
const productRepository = new InMemoryProductRepository();
const orderRepository = new InMemoryOrderRepository();
const paymentGateway = new FakePaymentGateway();

// 2. Instanciar Casos de Uso injetando as implementações das Portas (Inversão de Dependência)
const listProductsUseCase = new ListProductsUseCase(productRepository);
const checkoutOrderUseCase = new CheckoutOrderUseCase({
  productRepository,
  orderRepository,
  paymentGateway,
});

// 3. Instanciar o Adapter Primário (Driving Adapter / Entrada) injetando os Casos de Uso
const ecommerceController = new EcommerceHttpController({
  listProductsUseCase,
  checkoutOrderUseCase,
});

// 4. Iniciar o Servidor HTTP
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const httpServer = new HttpServer(ecommerceController);
httpServer.start(PORT);
