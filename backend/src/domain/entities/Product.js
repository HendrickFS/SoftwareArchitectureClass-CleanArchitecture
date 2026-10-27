/**
 * ============================================================================
 * CAMADA 1: DOMAIN (Entidades)
 * Arquivo: Product.js
 * ============================================================================
 *
 * CONCEITO ARQUITETURAL: ENTIDADE RICA vs. MODELO ANÊMICO
 * Um erro comum em projetos universitários e juniores é criar "Entidades Anêmicas":
 * classes que só têm getters/setters (ou objetos JSON puros) e deixar toda a
 * lógica de validação espalhada pelos Controllers ou Services.
 *
 * Na Clean Architecture, a Entidade protege suas próprias INVARIANTES
 * (regras que precisam ser sempre verdadeiras para que o objeto exista de forma válida).
 *
 * REGRA DA DEPENDÊNCIA (The Dependency Rule):
 * Observe os imports deste arquivo: ele só importa `DomainError` (da mesma camada).
 * Ele NÃO importa banco de dados, Express, Prisma, nem mesmo Casos de Uso!
 */

import { DomainError } from '../errors/DomainError.js';

export class Product {
  /**
   * @param {object} props
   * @param {string} props.id
   * @param {string} props.name
   * @param {number} props.price
   * @param {number} props.stock
   * @param {string} [props.category]
   */
  constructor({ id, name, price, stock, category = 'Geral' }) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.stock = stock;
    this.category = category;

    this.validateInvariants();
  }

  /**
   * Garante que nunca existirá um Produto inválido em memória.
   */
  validateInvariants() {
    if (!this.id || typeof this.id !== 'string') {
      throw new DomainError('O produto precisa de um ID válido.', 'INVALID_PRODUCT_ID');
    }
    if (!this.name || this.name.trim().length < 3) {
      throw new DomainError('O nome do produto deve ter pelo menos 3 caracteres.', 'INVALID_PRODUCT_NAME');
    }
    if (typeof this.price !== 'number' || this.price <= 0) {
      throw new DomainError(`O preço do produto "${this.name}" deve ser maior que zero.`, 'INVALID_PRODUCT_PRICE');
    }
    if (!Number.isInteger(this.stock) || this.stock < 0) {
      throw new DomainError(`O estoque do produto "${this.name}" não pode ser negativo ou fracionado.`, 'INVALID_PRODUCT_STOCK');
    }
  }

  /**
   * Regra de negócio de domínio: verificar disponibilidade no estoque.
   * @param {number} quantity
   * @returns {boolean}
   */
  hasStock(quantity) {
    return this.stock >= quantity;
  }

  /**
   * Regra de negócio de domínio: baixar estoque com proteção de invariante.
   *
   * O QUE QUEBRA SE NÃO USARMOS ESTE MÉTODO?
   * Se o Controller fizesse `product.stock = product.stock - quantity` diretamente,
   * um bug ou condição de corrida simples poderia deixar o estoque em -5 sem que
   * ninguém percebesse. Centralizando aqui, garantimos que o estoque nunca fica negativo.
   *
   * @param {number} quantity
   */
  decreaseStock(quantity) {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new DomainError('A quantidade para baixa de estoque deve ser um inteiro positivo.', 'INVALID_QUANTITY');
    }

    if (!this.hasStock(quantity)) {
      throw new DomainError(
        `Estoque insuficiente para "${this.name}". Disponível: ${this.stock}, Solicitado: ${quantity}.`,
        'INSUFFICIENT_STOCK'
      );
    }

    this.stock -= quantity;
  }

  /**
   * Devolve o estoque caso uma etapa posterior do pedido falhe (Compensação).
   * @param {number} quantity
   */
  restoreStock(quantity) {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new DomainError('A quantidade para estorno de estoque deve ser positiva.', 'INVALID_QUANTITY');
    }
    this.stock += quantity;
  }
}
