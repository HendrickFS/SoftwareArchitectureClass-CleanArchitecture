/**
 * ============================================================================
 * CAMADA 2: APPLICATION (Casos de Uso / Application Business Rules)
 * Arquivo: CheckoutOrderUseCase.js
 * ============================================================================
 *
 * CONCEITO ARQUITETURAL: DIFERENÇA ENTRE REGRA DE DOMÍNIO E CASO DE USO
 * - Regra de Domínio (Entidade): "Como calculo o desconto de 10%?" ou "O estoque pode ficar negativo?"
 * - Regra de Aplicação (Caso de Uso): "Qual é o passo a passo (orquestração) para fechar uma compra?"
 *   1. Buscar produtos no repositório e validar existência;
 *   2. Baixar o estoque usando a regra da entidade `Product`;
 *   3. Criar a entidade `Order` com os preços reais do catálogo (nunca confie no preço vindo do Frontend!);
 *   4. Chamar o Gateway de Pagamento;
 *   5. Se o pagamento falhar, desfazer a baixa de estoque (Compensação / Rollback);
 *   6. Salvar o pedido e os produtos atualizados.
 */

import { Order } from '../../domain/entities/Order.js';
import { DomainError } from '../../domain/errors/DomainError.js';

export class CheckoutOrderUseCase {
  /**
   * @param {object} dependencies - Injeção de Dependências via Construtor
   * @param {import('../ports/ProductRepositoryPort.js').ProductRepositoryPort} dependencies.productRepository
   * @param {import('../ports/OrderRepositoryPort.js').OrderRepositoryPort} dependencies.orderRepository
   * @param {import('../ports/PaymentGatewayPort.js').PaymentGatewayPort} dependencies.paymentGateway
   */
  constructor({ productRepository, orderRepository, paymentGateway }) {
    this.productRepository = productRepository;
    this.orderRepository = orderRepository;
    this.paymentGateway = paymentGateway;
  }

  /**
   * @param {object} inputDto - Dados de entrada (Input Boundary)
   * @param {string} inputDto.customerName
   * @param {string} inputDto.customerEmail
   * @param {string} [inputDto.paymentMethod]
   * @param {Array<{productId: string, quantity: number}>} inputDto.items
   */
  async execute(inputDto) {
    if (!inputDto || !Array.isArray(inputDto.items) || inputDto.items.length === 0) {
      throw new DomainError('O carrinho enviado para checkout está vazio.', 'EMPTY_CHECKOUT_ITEMS');
    }

    const orderItems = [];
    const productsToUpdate = [];

    // 1. Validar produtos e reservar/baixar estoque em memória nas Entidades
    for (const requestedItem of inputDto.items) {
      const product = await this.productRepository.findById(requestedItem.productId);

      if (!product) {
        throw new DomainError(
          `Produto com ID "${requestedItem.productId}" não foi encontrado no catálogo.`,
          'PRODUCT_NOT_FOUND'
        );
      }

      // A própria Entidade valida se há estoque suficiente e lança DomainError se não houver
      product.decreaseStock(requestedItem.quantity);
      productsToUpdate.push({ product, quantityDeducted: requestedItem.quantity });

      // SEGURANÇA ARQUITETURAL: Pegamos `product.price` do banco/domínio, NUNCA do inputDto do cliente!
      orderItems.push({
        productId: product.id,
        productName: product.name,
        unitPrice: product.price,
        quantity: requestedItem.quantity,
      });
    }

    // 2. Instanciar a Entidade Order (que aplica automaticamente regras de desconto e frete)
    const orderId = `ORD-${Date.now().toString().slice(-6)}`;
    const order = new Order({
      id: orderId,
      customerName: inputDto.customerName,
      customerEmail: inputDto.customerEmail,
      items: orderItems,
    });

    // 3. Processar pagamento através da Porta (sem saber qual é o provedor real)
    const paymentResult = await this.paymentGateway.processPayment({
      orderId: order.id,
      amount: order.total,
      customerEmail: order.customerEmail,
      paymentMethod: inputDto.paymentMethod || 'PIX',
    });

    if (!paymentResult.approved) {
      // COMPENSAÇÃO (Rollback manual em memória): devolve o estoque caso o pagamento seja recusado
      for (const entry of productsToUpdate) {
        entry.product.restoreStock(entry.quantityDeducted);
      }
      order.markAsFailed(paymentResult.errorMessage || 'Pagamento recusado pela operadora.');
      throw new DomainError(
        `Pagamento não aprovado: ${paymentResult.errorMessage || 'Transação recusada.'}`,
        'PAYMENT_REJECTED'
      );
    }

    // 4. Confirmar pagamento e persistir estado atualizado
    order.markAsPaid(paymentResult.transactionId);

    for (const entry of productsToUpdate) {
      await this.productRepository.save(entry.product);
    }

    await this.orderRepository.save(order);

    // 5. Retornar um Output DTO limpo para quem chamou o Caso de Uso (Output Boundary)
    return {
      orderId: order.id,
      status: order.status,
      transactionId: order.transactionId,
      customerName: order.customerName,
      summary: {
        subtotal: order.subtotal,
        discount: order.discount,
        shippingFee: order.shippingFee,
        total: order.total,
      },
      items: order.items,
      createdAt: order.createdAt.toISOString(),
    };
  }
}
