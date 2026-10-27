/**
 * ============================================================================
 * CAMADA 2: APPLICATION (Ports / Interfaces de Saída)
 * Arquivo: ProductRepositoryPort.js
 * ============================================================================
 *
 * CONCEITO ARQUITETURAL: INVERSÃO DE DEPENDÊNCIA (DIP - letra 'D' do SOLID)
 * Em uma arquitetura tradicional em camadas, o Serviço importa o Banco de Dados
 * (ex: `import prisma from '../db/prisma'`). Isso acopla sua regra de negócio
 * ao banco de dados.
 *
 * Na Clean Architecture, invertemos a seta! A camada de Aplicação define uma
 * "Porta" (Port / Interface) dizendo: "Qualquer banco de dados que queira conversar
 * comigo PRECISA implementar os métodos `findAll`, `findById` e `save`".
 *
 * NOTA DIDÁTICA SOBRE JAVASCRIPT:
 * Em TypeScript ou Java usaríamos `interface ProductRepositoryPort`. Em JavaScript
 * puro, usamos uma classe base que lança erro caso a classe filha esqueça de
 * implementar algum método do contrato.
 */

export class ProductRepositoryPort {
  /**
   * Retorna todos os produtos disponíveis no catálogo.
   * @returns {Promise<import('../../domain/entities/Product.js').Product[]>}
   */
  async findAll() {
    throw new Error('Contrato violado: o método findAll() precisa ser implementado pelo Adapter.');
  }

  /**
   * Busca um produto pelo seu ID único.
   * @param {string} id
   * @returns {Promise<import('../../domain/entities/Product.js').Product | null>}
   */
  async findById(id) {
    throw new Error('Contrato violado: o método findById(id) precisa ser implementado pelo Adapter.');
  }

  /**
   * Persiste alterações de um produto (ex: atualização de estoque).
   * @param {import('../../domain/entities/Product.js').Product} product
   * @returns {Promise<void>}
   */
  async save(product) {
    throw new Error('Contrato violado: o método save(product) precisa ser implementado pelo Adapter.');
  }
}
