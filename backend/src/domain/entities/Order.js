/**
 * ============================================================================
 * CAMADA 1: DOMAIN (Entidades)
 * Arquivo: Order.js
 * ============================================================================
 *
 * CONCEITO ARQUITETURAL: REGRAS DE NEGÓCIO PURAS
 * Esta entidade concentra as políticas centrais do E-commerce:
 * 1. Um pedido não pode ser criado vazio.
 * 2. Compras acima de R$ 500,00 ganham 10% de desconto automático.
 * 3. Compras abaixo de R$ 200,00 pagam R$ 25,00 de frete; acima disso, frete grátis.
 *
 * Por que essas regras estão na Entidade `Order` e não no Frontend ou no Banco de Dados?
 * - Se estivessem só no Frontend, um usuário mal-intencionado poderia enviar uma
 *   requisição HTTP direta alterando o valor total para R$ 0,01.
 * - Se estivessem em uma Stored Procedure no banco, seria difícil testar unitariamente
 *   sem subir um banco de dados real.
 * - Estando na Entidade, podemos testar essas regras em milissegundos!
 */

import { DomainError } from '../errors/DomainError.js';

export class Order {
  /**
   * @param {object} props
   * @param {string} props.id
   * @param {string} props.customerName
   * @param {string} props.customerEmail
   * @param {Array<{productId: string, productName: string, unitPrice: number, quantity: number}>} props.items
   * @param {Date} [props.createdAt]
   */
  constructor({ id, customerName, customerEmail, items, createdAt = new Date() }) {
    this.id = id;
    this.customerName = customerName;
    this.customerEmail = customerEmail;
    this.items = items || [];
    this.createdAt = createdAt;
    this.status = 'PENDING'; // PENDING | PAID | FAILED

    this.validate();

    // Cálculos de domínio executados de forma determinística
    this.subtotal = this.calculateSubtotal();
    this.discount = this.calculateDiscount(this.subtotal);
    this.shippingFee = this.calculateShippingFee(this.subtotal - this.discount);
    this.total = this.roundCurrency(this.subtotal - this.discount + this.shippingFee);
  }

  validate() {
    if (!this.customerName || this.customerName.trim().length < 2) {
      throw new DomainError('Nome do cliente é obrigatório para emitir o pedido.', 'INVALID_CUSTOMER_NAME');
    }
    if (!this.customerEmail || !this.customerEmail.includes('@')) {
      throw new DomainError('E-mail do cliente inválido.', 'INVALID_CUSTOMER_EMAIL');
    }
    if (!Array.isArray(this.items) || this.items.length === 0) {
      throw new DomainError('Não é possível criar um pedido sem itens.', 'EMPTY_ORDER');
    }

    for (const item of this.items) {
      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        throw new DomainError(`Quantidade inválida para o item "${item.productName}".`, 'INVALID_ITEM_QUANTITY');
      }
      if (typeof item.unitPrice !== 'number' || item.unitPrice <= 0) {
        throw new DomainError(`Preço unitário inválido para o item "${item.productName}".`, 'INVALID_ITEM_PRICE');
      }
    }
  }

  calculateSubtotal() {
    const sum = this.items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
    return this.roundCurrency(sum);
  }

  /**
   * Política de Desconto: 10% de desconto para compras com subtotal >= R$ 500,00
   * @param {number} subtotal
   */
  calculateDiscount(subtotal) {
    if (subtotal >= 500) {
      return this.roundCurrency(subtotal * 0.10);
    }
    return 0;
  }

  /**
   * Política de Frete: Grátis para valor líquido >= R$ 200,00; caso contrário R$ 25,00
   * @param {number} netAmount
   */
  calculateShippingFee(netAmount) {
    if (netAmount >= 200) {
      return 0;
    }
    return 25.00;
  }

  markAsPaid(transactionId) {
    if (!transactionId) {
      throw new DomainError('Um pedido só pode ser marcado como pago com um ID de transação válido.', 'MISSING_TRANSACTION_ID');
    }
    this.status = 'PAID';
    this.transactionId = transactionId;
  }

  markAsFailed(reason) {
    this.status = 'FAILED';
    this.failureReason = reason;
  }

  roundCurrency(value) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }
}
