/**
 * ============================================================================
 * FRONTEND - CAMADA 2: APPLICATION (Caso de Uso: Carregar Catálogo)
 * Arquivo: LoadCatalogUseCase.js
 * ============================================================================
 */

export class LoadCatalogUseCase {
  /**
   * @param {import('../ports/EcommerceApiPort.js').EcommerceApiPort} apiGateway
   */
  constructor(apiGateway) {
    this.apiGateway = apiGateway;
  }

  async execute() {
    return await this.apiGateway.getProducts();
  }
}
