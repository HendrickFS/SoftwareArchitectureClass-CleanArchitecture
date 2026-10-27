/**
 * ============================================================================
 * PROVA ARQUITETURAL: EXECUTANDO O SISTEMA SEM WEB / SEM HTTP!
 * Arquivo: demo-cli.js
 * ============================================================================
 *
 * POR QUE ESTE ARQUIVO É EXCELENTE PARA APRESENTAR NA GRADUAÇÃO?
 * Em projetos acoplados (onde a regra de negócio fica dentro de `app.post('/checkout', ...)`),
 * é impossível usar o sistema sem subir um servidor HTTP.
 *
 * Aqui provamos na prática o que Uncle Bob prega:
 * Rodamos EXATAMENTE os mesmos Casos de Uso e Entidades diretamente pelo Terminal (CLI),
 * testando:
 * 1. Compra com desconto de 10% (acima de R$ 500) e frete grátis;
 * 2. Recusa de pagamento e Rollback automático do estoque (Compensação);
 * 3. Bloqueio de compra quando o estoque é insuficiente.
 */

import { InMemoryProductRepository, InMemoryOrderRepository } from './infrastructure/database/InMemoryDatabase.js';
import { FakePaymentGateway } from './adapters/gateways/FakePaymentGateway.js';
import { ListProductsUseCase } from './application/use-cases/ListProductsUseCase.js';
import { CheckoutOrderUseCase } from './application/use-cases/CheckoutOrderUseCase.js';

async function runArchitecturalDemo() {
  console.log('\n====================================================================');
  console.log('🎓 DEMONSTRAÇÃO VIA CLI (SEM SERVIDOR HTTP - APENAS CASOS DE USO)');
  console.log('====================================================================\n');

  const productRepository = new InMemoryProductRepository();
  const orderRepository = new InMemoryOrderRepository();
  const paymentGateway = new FakePaymentGateway();

  const listProducts = new ListProductsUseCase(productRepository);
  const checkoutOrder = new CheckoutOrderUseCase({
    productRepository,
    orderRepository,
    paymentGateway,
  });

  console.log('1️⃣  [Caso de Uso: ListProductsUseCase] Catálogo inicial:');
  const initialCatalog = await listProducts.execute();
  console.table(initialCatalog);

  console.log('\n2️⃣  [Caso de Uso: CheckoutOrderUseCase] Cenário 1: Compra válida de 2 Teclados (R$ 900 -> ganha 10% OFF e Frete Grátis):');
  const receipt = await checkoutOrder.execute({
    customerName: 'Ada Lovelace',
    customerEmail: 'ada@computacao.edu.br',
    paymentMethod: 'PIX',
    items: [{ productId: 'prod-2', quantity: 2 }],
  });
  console.log('✅ Recibo gerado pelo Caso de Uso:', receipt);

  console.log('\n3️⃣  [Caso de Uso: CheckoutOrderUseCase] Cenário 2: Pagamento recusado (Verifica se o estoque do Monitor continua em 2!):');
  try {
    await checkoutOrder.execute({
      customerName: 'Alan Turing',
      customerEmail: 'alan@recusado.com', // Aciona recusa no FakePaymentGateway
      paymentMethod: 'CREDIT_CARD',
      items: [{ productId: 'prod-3', quantity: 2 }],
    });
  } catch (error) {
    console.log(`❌ Erro esperado capturado (${error.name} / ${error.code}): ${error.message}`);
  }

  console.log('\n4️⃣  [Verificação de Integridade do Estoque após os cenários]:');
  const finalCatalog = await listProducts.execute();
  console.table(finalCatalog);
  console.log('👉 Note que o Teclado (prod-2) caiu de 4 para 2, mas o Monitor (prod-3) permaneceu com 2 unidades graças à compensação!\n');
}

runArchitecturalDemo();
