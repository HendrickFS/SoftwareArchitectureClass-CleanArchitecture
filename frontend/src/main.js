/**
 * ============================================================================
 * FRONTEND - COMPOSITION ROOT (Ponto de Montagem do Cliente)
 * Arquivo: main.js
 * ============================================================================
 *
 * Conecta as 4 camadas da Clean Architecture no Navegador:
 * 1. Domain (`Cart`)
 * 2. Application (`LoadCatalogUseCase`, `PlaceOrderUseCase`)
 * 3. Adapters (`FetchEcommerceApiGateway`, `StorePresenter`)
 * 4. Infrastructure (`DomStoreView`)
 */

import { Cart } from './domain/Cart.js';
import { LoadCatalogUseCase } from './application/use-cases/LoadCatalogUseCase.js';
import { PlaceOrderUseCase } from './application/use-cases/PlaceOrderUseCase.js';
import { FetchEcommerceApiGateway } from './adapters/gateways/FetchEcommerceApiGateway.js';
import { StorePresenter } from './adapters/presenters/StorePresenter.js';
import { DomStoreView } from './infrastructure/ui/DomStoreView.js';

// 1. Instanciar Entidade de Domínio, Gateway, Casos de Uso e View
const cart = new Cart();
const apiGateway = new FetchEcommerceApiGateway('http://localhost:3000/api');
const loadCatalogUseCase = new LoadCatalogUseCase(apiGateway);
const placeOrderUseCase = new PlaceOrderUseCase(apiGateway);
const view = new DomStoreView();

let currentCatalogProducts = [];

async function refreshCatalog() {
  try {
    view.logLayerAction('[Camada 2: UseCase]', 'Executando LoadCatalogUseCase...');
    currentCatalogProducts = await loadCatalogUseCase.execute();

    view.logLayerAction('[Camada 3: Presenter]', 'Formatando dados brutos para ViewModel do Catálogo...');
    const catalogViewModel = StorePresenter.presentCatalog(currentCatalogProducts);

    view.logLayerAction('[Camada 4: View/DOM]', 'Renderizando cards de produtos no HTML.');
    view.renderCatalog(catalogViewModel, handleAddProduct);
  } catch (error) {
    view.showError(error.message);
  }
}

function refreshCartView() {
  const cartViewModel = StorePresenter.presentCart(cart);
  view.renderCart(cartViewModel, handleDecreaseItem);
}

function handleAddProduct(productId) {
  const product = currentCatalogProducts.find((p) => p.id === productId);
  if (!product) return;

  try {
    view.logLayerAction('[Camada 1: Domain]', `Cart.addItem("${product.name}") validando invariantes de estoque...`);
    cart.addItem(product);
    refreshCartView();
  } catch (domainError) {
    view.logLayerAction('[Camada 1: Domain Error]', domainError.message);
    view.showError(domainError.message);
  }
}

function handleDecreaseItem(productId) {
  view.logLayerAction('[Camada 1: Domain]', `Cart.decreaseItem("${productId}") recalculando subtotal/frete...`);
  cart.decreaseItem(productId);
  refreshCartView();
}

view.bindCheckoutSubmit(async ({ customerName, customerEmail, paymentMethod }) => {
  try {
    view.logLayerAction('[Camada 2: UseCase]', 'PlaceOrderUseCase.execute() enviando pedido via Porta...');
    const rawReceipt = await placeOrderUseCase.execute({
      cart,
      customerName,
      customerEmail,
      paymentMethod,
    });

    view.logLayerAction('[Camada 3: Presenter]', 'Transformando recibo da API em ViewModel...');
    const receiptViewModel = StorePresenter.presentOrderReceipt(rawReceipt);

    view.showSuccessReceipt(receiptViewModel);
    refreshCartView();
    await refreshCatalog(); // Atualiza o estoque exibido na tela após a compra!
  } catch (error) {
    view.logLayerAction('[Camada 3: Adapter Error]', error.message);
    view.showError(error.message);
  }
});

// Inicialização da aplicação
refreshCartView();
refreshCatalog();
