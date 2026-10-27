/**
 * ============================================================================
 * CAMADA 2: APPLICATION (Ports / Interfaces de Saída)
 * Arquivo: OrderRepositoryPort.js
 * ============================================================================
 *
 * Contrato para persistência de Pedidos.
 * O Caso de Uso não sabe se o pedido será salvo em memória, no PostgreSQL,
 * no MongoDB ou num arquivo texto. Ele apenas confia neste contrato.
 */

export class OrderRepositoryPort {
  /**
   * Salva um pedido no mecanismo de persistência.
   * @param {import('../../domain/entities/Order.js').Order} order
   * @returns {Promise<void>}
   */
  async save(order) {
    throw new Error('Contrato violado: o método save(order) precisa ser implementado pelo Adapter.');
  }

  /**
   * Lista todos os pedidos realizados.
   * @returns {Promise<import('../../domain/entities/Order.js').Order[]>}
   */
  async findAll() {
    throw new Error('Contrato violado: o método findAll() precisa ser implementado pelo Adapter.');
  }
}
