/**
 * ============================================================================
 * FRONTEND - CAMADA 2: APPLICATION (Port de Comunicação com Backend)
 * Arquivo: EcommerceApiPort.js
 * ============================================================================
 *
 * Contrato que isola os Casos de Uso do Frontend de detalhes como `fetch`,
 * `axios`, GraphQL ou URLs de endpoints.
 */

export class EcommerceApiPort {
  async getProducts() {
    throw new Error('Método getProducts() deve ser implementado pelo Gateway.');
  }

  async checkout(orderPayload) {
    throw new Error('Método checkout(orderPayload) deve ser implementado pelo Gateway.');
  }
}
