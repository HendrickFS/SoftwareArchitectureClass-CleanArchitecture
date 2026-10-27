/**
 * ============================================================================
 * FRONTEND - CAMADA 3: INTERFACE ADAPTERS (Presenter)
 * Arquivo: StorePresenter.js
 * ============================================================================
 *
 * CONCEITO ARQUITETURAL: O QUE É UM PRESENTER NA CLEAN ARCHITECTURE?
 * No diagrama clássico do Uncle Bob, o Presenter fica na Camada 3 (Adapters).
 * O papel dele é receber dados brutos do Domínio/Caso de Uso (ex: `price: 120`, `stock: 0`)
 * e transformá-los em um "ViewModel" (strings já formatadas em R$, textos de badge,
 * flags booleanas prontas para a tela).
 *
 * Assim, a View (HTML/DOM ou Componente React) fica "burra" (Humble Object Pattern):
 * ela não faz cálculos nem formata moedas, apenas exibe as strings que o Presenter preparou!
 */

export class StorePresenter {
  static formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }

  /**
   * Transforma a lista de produtos da API em um ViewModel pronto para renderizar.
   */
  static presentCatalog(products) {
    return products.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      formattedPrice: this.formatCurrency(p.price),
      stockBadgeText: p.stock > 0 ? `${p.stock} em estoque` : 'Esgotado',
      isOutOfStock: p.stock <= 0,
      buttonLabel: p.stock > 0 ? 'Adicionar ao Carrinho' : 'Indisponível',
    }));
  }

  /**
   * Transforma a entidade `Cart` em um ViewModel formatado para a barra lateral.
   * @param {import('../../domain/Cart.js').Cart} cart
   */
  static presentCart(cart) {
    const totals = cart.getTotals();
    const items = cart.getItemsList().map((entry) => ({
      id: entry.product.id,
      name: entry.product.name,
      quantity: entry.quantity,
      unitPriceFormatted: this.formatCurrency(entry.product.price),
      lineTotalFormatted: this.formatCurrency(entry.product.price * entry.quantity),
    }));

    let promoHint = '🎉 Você desbloqueou 10% OFF + Frete Grátis!';
    if (totals.subtotal === 0) {
      promoHint = '💡 Compras acima de R$ 200 têm Frete Grátis e acima de R$ 500 ganham 10% OFF!';
    } else if (totals.remainingForFreeShipping > 0) {
      promoHint = `🚚 Faltam ${this.formatCurrency(totals.remainingForFreeShipping)} para ganhar Frete Grátis!`;
    } else if (totals.remainingForDiscount > 0) {
      promoHint = `🏷️ Frete Grátis garantido! Faltam ${this.formatCurrency(totals.remainingForDiscount)} para ganhar 10% de desconto!`;
    }

    return {
      isEmpty: cart.isEmpty(),
      items,
      subtotalFormatted: this.formatCurrency(totals.subtotal),
      discountFormatted: totals.discount > 0 ? `- ${this.formatCurrency(totals.discount)}` : 'R$ 0,00',
      hasDiscount: totals.discount > 0,
      shippingFormatted: totals.shippingFee === 0 && !cart.isEmpty() ? 'GRÁTIS' : this.formatCurrency(totals.shippingFee),
      totalFormatted: this.formatCurrency(totals.total),
      promoHint,
    };
  }

  /**
   * Formata o recibo de pedido retornado pelo Caso de Uso de Checkout.
   */
  static presentOrderReceipt(receipt) {
    return {
      orderId: receipt.orderId,
      transactionId: receipt.transactionId,
      customerName: receipt.customerName,
      totalFormatted: this.formatCurrency(receipt.summary.total),
      discountFormatted: this.formatCurrency(receipt.summary.discount),
      shippingFormatted: receipt.summary.shippingFee === 0 ? 'GRÁTIS' : this.formatCurrency(receipt.summary.shippingFee),
    };
  }
}
