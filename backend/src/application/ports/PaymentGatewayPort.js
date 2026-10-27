/**
 * ============================================================================
 * CAMADA 2: APPLICATION (Ports / Interfaces de Saída)
 * Arquivo: PaymentGatewayPort.js
 * ============================================================================
 *
 * Contrato para processamento de pagamentos externos (Stripe, MercadoPago, Pagar.me).
 *
 * O QUE QUEBRA SE NÃO TIVERMOS ESTE PORT?
 * Se chamarmos o SDK do Stripe diretamente dentro do Caso de Uso (`CheckoutOrderUseCase`),
 * toda vez que rodarmos testes automatizados cobraremos cartões de verdade ou
 * dependeremos de internet. Além disso, se a empresa trocar o Stripe pelo MercadoPago,
 * teríamos que reescrever a lógica do Caso de Uso!
 */

export class PaymentGatewayPort {
  /**
   * Processa a cobrança de um valor para um cliente.
   * @param {object} paymentData
   * @param {string} paymentData.orderId
   * @param {number} paymentData.amount
   * @param {string} paymentData.customerEmail
   * @param {string} paymentData.paymentMethod - 'PIX' | 'CREDIT_CARD'
   * @returns {Promise<{ approved: boolean, transactionId?: string, errorMessage?: string }>}
   */
  async processPayment(paymentData) {
    throw new Error('Contrato violado: o método processPayment() precisa ser implementado pelo Adapter.');
  }
}
