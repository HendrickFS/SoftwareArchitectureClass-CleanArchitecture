/**
 * ============================================================================
 * CAMADA 3: INTERFACE ADAPTERS (Controllers)
 * Arquivo: EcommerceHttpController.js
 * ============================================================================
 *
 * CONCEITO ARQUITETURAL: O PAPEL DO CONTROLLER NA CLEAN ARCHITECTURE
 * Pense no Controller como um "Adaptador de Tomada":
 * - O mundo externo fala HTTP (Headers, Query Params, Body JSON, Status 200/400/500).
 * - O Caso de Uso (Camada 2) fala objetos JavaScript puros (DTOs) e lança `DomainError`.
 *
 * O Controller NÃO contém regras de negócio! Ele apenas:
 * 1. Desempacota os dados da requisição HTTP;
 * 2. Chama o Caso de Uso correspondente;
 * 3. Traduz o resultado (ou `DomainError`) para um código de status HTTP adequado.
 */

import { DomainError } from '../../domain/errors/DomainError.js';

export class EcommerceHttpController {
  /**
   * @param {object} useCases
   * @param {import('../../application/use-cases/ListProductsUseCase.js').ListProductsUseCase} useCases.listProductsUseCase
   * @param {import('../../application/use-cases/CheckoutOrderUseCase.js').CheckoutOrderUseCase} useCases.checkoutOrderUseCase
   */
  constructor({ listProductsUseCase, checkoutOrderUseCase }) {
    this.listProductsUseCase = listProductsUseCase;
    this.checkoutOrderUseCase = checkoutOrderUseCase;
  }

  /**
   * Manipula GET /api/products
   */
  async handleListProducts() {
    try {
      const productsDto = await this.listProductsUseCase.execute();
      return {
        statusCode: 200,
        body: {
          success: true,
          data: productsDto,
        },
      };
    } catch (error) {
      return this.mapErrorToHttpResponse(error);
    }
  }

  /**
   * Manipula POST /api/checkout
   * @param {object} httpRequestBody - Corpo JSON vindo da requisição HTTP
   */
  async handleCheckout(httpRequestBody) {
    try {
      const orderReceiptDto = await this.checkoutOrderUseCase.execute({
        customerName: httpRequestBody?.customerName,
        customerEmail: httpRequestBody?.customerEmail,
        paymentMethod: httpRequestBody?.paymentMethod,
        items: httpRequestBody?.items,
      });

      return {
        statusCode: 201,
        body: {
          success: true,
          message: 'Pedido processado com sucesso!',
          data: orderReceiptDto,
        },
      };
    } catch (error) {
      return this.mapErrorToHttpResponse(error);
    }
  }

  /**
   * Tradutor centralizado de erros de Domínio para Semântica HTTP.
   * Repare como o Domínio nem sabe o que é "Status 422" ou "Status 500"!
   */
  mapErrorToHttpResponse(error) {
    if (error instanceof DomainError) {
      return {
        statusCode: 422, // Unprocessable Entity (Erro de regra de negócio/validação)
        body: {
          success: false,
          errorCode: error.code,
          message: error.message,
        },
      };
    }

    console.error('[Erro Interno Inesperado]:', error);
    return {
      statusCode: 500,
      body: {
        success: false,
        errorCode: 'INTERNAL_SERVER_ERROR',
        message: 'Ocorreu um erro interno inesperado no servidor.',
      },
    };
  }
}
