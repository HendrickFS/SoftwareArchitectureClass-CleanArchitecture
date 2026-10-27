/**
 * ============================================================================
 * CAMADA 1: DOMAIN (Regras de Negócio Corporativas / Enterprise Business Rules)
 * Arquivo: DomainError.js
 * ============================================================================
 *
 * POR QUE ESTE ARQUIVO EXISTE?
 * Na Clean Architecture, a camada de Domínio NÃO conhece o protocolo HTTP.
 * Portanto, uma Entidade nunca deve lançar um erro dizendo "400 Bad Request"
 * ou "422 Unprocessable Entity". Ela lança um `DomainError` (ex: "Estoque insuficiente").
 *
 * O QUE QUEBRA SE FIZERMOS ERRADO?
 * Se colocarmos `statusCode = 400` dentro da Entidade e amanhã o sistema passar
 * a processar pedidos via fila (RabbitMQ/Kafka), CLI ou gRPC, códigos HTTP farão
 * zero sentido. Quem traduz `DomainError` para HTTP 400 é o Controller (Camada 3).
 */

export class DomainError extends Error {
  /**
   * @param {string} message - Mensagem explicando qual regra de negócio foi violada.
   * @param {string} [code] - Código semântico do domínio (ex: 'INSUFFICIENT_STOCK').
   */
  constructor(message, code = 'DOMAIN_RULE_VIOLATION') {
    super(message);
    this.name = 'DomainError';
    this.code = code;
  }
}
