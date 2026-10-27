/**
 * ============================================================================
 * CAMADA 2: APPLICATION (Casos de Uso / Application Business Rules)
 * Arquivo: ListProductsUseCase.js
 * ============================================================================
 *
 * POR QUE TER UM CASO DE USO SÓ PARA LISTAR PRODUTOS?
 * Em sistemas pequenos parece burocracia ("pass-through"), mas o Caso de Uso
 * documenta explícita e arquiteturalmente O QUE o sistema faz (Screaming Architecture).
 * Além disso, se amanhã precisarmos ocultar produtos fora de estoque ou registrar
 * auditoria de visualização, o lugar já existe sem sujar o Controller nem a Entidade.
 */

export class ListProductsUseCase {
  /**
   * Recebe a abstração (Port) via Injeção de Dependência no construtor.
   * @param {import('../ports/ProductRepositoryPort.js').ProductRepositoryPort} productRepository
   */
  constructor(productRepository) {
    this.productRepository = productRepository;
  }

  /**
   * Executa o caso de uso e retorna um DTO (Data Transfer Object) simples,
   * evitando expor métodos internos das entidades para as camadas externas.
   */
  async execute() {
    const products = await this.productRepository.findAll();

    return products.map((product) => ({
      id: product.id,
      name: product.name,
      price: product.price,
      stock: product.stock,
      category: product.category,
      available: product.hasStock(1),
    }));
  }
}
