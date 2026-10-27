/**
 * ============================================================================
 * CAMADA 3: INTERFACE ADAPTERS (Gateways Externos)
 * Arquivo: FakePaymentGateway.js
 * ============================================================================
 *
 * CONCEITO ARQUITETURAL: IMPLEMENTANDO UM PORT (INVERSÃO DE DEPENDÊNCIA)
 * Observe a palavra `extends PaymentGatewayPort`.
 * A seta de dependência aponta de FORA (Camada 3 - Adapters) para DENTRO
 * (Camada 2 - Application). Isso obedece à Regra da Dependência do Uncle Bob!
 *
 * Para fins didáticos na apresentação:
 * - Se o e-mail do cliente contiver "recusado" (ex: `teste@recusado.com`),
 *   simulamos uma recusa de cartão para demonstrar o rollback de estoque!
 * - Caso contrário, aprovamos o pagamento e geramos um protocolo.
 */

import { PaymentGatewayPort } from '../../application/ports/PaymentGatewayPort.js';

export class FakePaymentGateway extends PaymentGatewayPort {
  async processPayment({ orderId, amount, customerEmail, paymentMethod }) {
    console.log(
      `[PaymentGateway Adapter] Processando ${paymentMethod} de R$ ${amount.toFixed(2)} para ${customerEmail} (Pedido ${orderId})...`
    );

    // Regra didática para simular falha de pagamento durante a apresentação na aula:
    if (customerEmail.toLowerCase().includes('recusado')) {
      return {
        approved: false,
        errorMessage: 'Cartão sem limite ou transação negada pelo banco emissor (Simulação Didática).',
      };
    }

    const randomHash = Math.random().toString(36).substring(2, 8).toUpperCase();
    return {
      approved: true,
      transactionId: `TX-${paymentMethod}-${randomHash}`,
    };
  }
}
