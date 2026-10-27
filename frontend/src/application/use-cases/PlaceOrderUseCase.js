/**
 * ============================================================================
 * FRONTEND - CAMADA 2: APPLICATION (Caso de Uso: Finalizar Pedido)
 * Arquivo: PlaceOrderUseCase.js
 * ============================================================================
 *
 * Orquestra o fechamento do pedido no Frontend:
 * 1. Verifica se o carrinho possui itens;
 * 2. Monta o payload de comunicação a partir da entidade `Cart`;
 * 3. Envia para o Port da API;
 * 4. Se der certo, limpa o carrinho local e retorna o recibo.
 */

export class PlaceOrderUseCase {
  /**
   * @param {import('../ports/EcommerceApiPort.js').EcommerceApiPort} apiGateway
   */
  constructor(apiGateway) {
    this.apiGateway = apiGateway;
  }

  /**
   * @param {object} params
   * @param {import('../../domain/Cart.js').Cart} params.cart
   * @param {string} params.customerName
   * @param {string} params.customerEmail
   * @param {string} params.paymentMethod
   */
  async execute({ cart, customerName, customerEmail, paymentMethod }) {
    if (cart.isEmpty()) {
      throw new Error('Adicione pelo menos um produto ao carrinho antes de finalizar.');
    }

    const itemsPayload = cart.getItemsList().map((entry) => ({
      productId: entry.product.id,
      quantity: entry.quantity,
    }));

    const receipt = await this.apiGateway.checkout({
      customerName,
      customerEmail,
      paymentMethod,
      items: itemsPayload,
    });

    // Se o checkout na API não lançou erro, limpamos o carrinho local
    cart.clear();

    return receipt;
  }
}
