/**
 * ============================================================================
 * FRONTEND - CAMADA 1: DOMAIN (Entidade Carrinho de Compras)
 * Arquivo: Cart.js
 * ============================================================================
 *
 * CONCEITO ARQUITETURAL: CLEAN ARCHITECTURE NO FRONTEND? SIM!
 * No Frontend, um erro clássico é misturar estado e regra de negócio dentro de
 * eventos de clique do DOM ou dentro de componentes visuais (`useEffect` / `onClick`).
 *
 * Esta classe `Cart` é 100% JavaScript puro:
 * - Não conhece `document.getElementById`, não conhece React/Vue/Angular;
 * - Não sabe o que é `fetch` ou `localStorage`;
 * - Contém as regras de cálculo e limite de estoque do carrinho no cliente.
 */

export class Cart {
  constructor() {
    /**
     * Mapa de productId -> { product, quantity }
     * @type {Map<string, { product: { id: string, name: string, price: number, stock: number }, quantity: number }>}
     */
    this.items = new Map();
  }

  /**
   * Adiciona uma unidade de um produto ao carrinho respeitando o limite de estoque.
   * @param {{ id: string, name: string, price: number, stock: number }} product
   */
  addItem(product) {
    if (product.stock <= 0) {
      throw new Error(`O produto "${product.name}" está esgotado.`);
    }

    const currentEntry = this.items.get(product.id);
    const currentQty = currentEntry ? currentEntry.quantity : 0;

    if (currentQty + 1 > product.stock) {
      throw new Error(`Limite de estoque atingido para "${product.name}" (Máx: ${product.stock}).`);
    }

    this.items.set(product.id, {
      product,
      quantity: currentQty + 1,
    });
  }

  /**
   * Remove uma unidade ou o item inteiro do carrinho.
   * @param {string} productId
   */
  decreaseItem(productId) {
    const entry = this.items.get(productId);
    if (!entry) return;

    if (entry.quantity <= 1) {
      this.items.delete(productId);
    } else {
      this.items.set(productId, {
        ...entry,
        quantity: entry.quantity - 1,
      });
    }
  }

  clear() {
    this.items.clear();
  }

  getItemsList() {
    return Array.from(this.items.values());
  }

  isEmpty() {
    return this.items.size === 0;
  }

  /**
   * Calcula a prévia financeira do carrinho seguindo as mesmas regras de negócio:
   * - Acima de R$ 500,00: 10% de desconto
   * - Valor líquido >= R$ 200,00: Frete grátis (senão R$ 25,00)
   */
  getTotals() {
    const list = this.getItemsList();
    const subtotal = list.reduce((sum, entry) => sum + entry.product.price * entry.quantity, 0);

    if (subtotal === 0) {
      return {
        subtotal: 0,
        discount: 0,
        shippingFee: 0,
        total: 0,
        remainingForFreeShipping: 200,
        remainingForDiscount: 500,
      };
    }

    const discount = subtotal >= 500 ? subtotal * 0.10 : 0;
    const netSubtotal = subtotal - discount;
    const shippingFee = netSubtotal >= 200 ? 0 : 25.00;
    const total = netSubtotal + shippingFee;

    return {
      subtotal,
      discount,
      shippingFee,
      total,
      remainingForFreeShipping: Math.max(0, 200 - netSubtotal),
      remainingForDiscount: Math.max(0, 500 - subtotal),
    };
  }
}
