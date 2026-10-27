/**
 * ============================================================================
 * FRONTEND - CAMADA 3: INTERFACE ADAPTERS (Gateway HTTP)
 * Arquivo: FetchEcommerceApiGateway.js
 * ============================================================================
 *
 * Implementa a porta `EcommerceApiPort` usando a API nativa `fetch()` do navegador.
 * Se amanhã o backend mudar de REST para GraphQL ou WebSockets, apenas este
 * arquivo muda no Frontend!
 */

import { EcommerceApiPort } from '../../application/ports/EcommerceApiPort.js';

export class FetchEcommerceApiGateway extends EcommerceApiPort {
  constructor(baseUrl = 'http://localhost:3000/api') {
    super();
    this.baseUrl = baseUrl;
  }

  async getProducts() {
    const response = await fetch(`${this.baseUrl}/products`);
    const json = await response.json();

    if (!response.ok || !json.success) {
      throw new Error(json.message || 'Erro ao carregar produtos do servidor.');
    }

    return json.data;
  }

  async checkout(orderPayload) {
    const response = await fetch(`${this.baseUrl}/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload),
    });

    const json = await response.json();

    if (!response.ok || !json.success) {
      throw new Error(json.message || 'Falha ao processar o checkout.');
    }

    return json.data;
  }
}
