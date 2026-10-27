/**
 * ============================================================================
 * FRONTEND - CAMADA 4: INFRASTRUCTURE (UI / DOM Manipulation)
 * Arquivo: DomStoreView.js
 * ============================================================================
 *
 * CONCEITO ARQUITETURAL: HUMBLE OBJECT PATTERN (A View Humilde)
 * Este é o ÚNICO arquivo de todo o Frontend que sabe que existe `document`,
 * `innerHTML` ou eventos de clique do navegador.
 *
 * Se decidirmos migrar este Frontend de Vanilla JS para React, Vue ou Svelte,
 * substituímos APENAS este arquivo (`DomStoreView.js`), mantendo `Cart.js`,
 * `LoadCatalogUseCase.js`, `PlaceOrderUseCase.js` e `StorePresenter.js` intactos!
 */

export class DomStoreView {
  constructor() {
    this.catalogContainer = document.getElementById('catalog-list');
    this.cartItemsContainer = document.getElementById('cart-items');
    this.subtotalEl = document.getElementById('summary-subtotal');
    this.discountEl = document.getElementById('summary-discount');
    this.shippingEl = document.getElementById('summary-shipping');
    this.totalEl = document.getElementById('summary-total');
    this.promoBannerEl = document.getElementById('promo-hint');
    this.checkoutForm = document.getElementById('checkout-form');
    this.feedbackBox = document.getElementById('feedback-box');
    this.architectureLogEl = document.getElementById('arch-log-list');
  }

  /**
   * Registra no painel didático da tela qual camada da Clean Architecture acabou de agir.
   */
  logLayerAction(layerBadge, message) {
    if (!this.architectureLogEl) return;
    const li = document.createElement('li');
    const time = new Date().toLocaleTimeString('pt-BR');
    li.innerHTML = `<span class="log-time">[${time}]</span> <strong>${layerBadge}</strong>: ${message}`;
    this.architectureLogEl.prepend(li);
  }

  /**
   * Renderiza a grade de produtos usando apenas o ViewModel já formatado pelo Presenter.
   */
  renderCatalog(catalogViewModel, onAddProductClick) {
    this.catalogContainer.innerHTML = '';

    for (const item of catalogViewModel) {
      const card = document.createElement('div');
      card.className = `product-card ${item.isOutOfStock ? 'out-of-stock' : ''}`;
      card.innerHTML = `
        <div class="product-header">
          <span class="category-tag">${item.category}</span>
          <span class="stock-badge ${item.isOutOfStock ? 'badge-danger' : 'badge-ok'}">${item.stockBadgeText}</span>
        </div>
        <h3>${item.name}</h3>
        <p class="price">${item.formattedPrice}</p>
        <button class="btn-add" data-id="${item.id}" ${item.isOutOfStock ? 'disabled' : ''}>
          ${item.buttonLabel}
        </button>
      `;

      const btn = card.querySelector('.btn-add');
      btn.addEventListener('click', () => onAddProductClick(item.id));
      this.catalogContainer.appendChild(card);
    }
  }

  /**
   * Renderiza o carrinho e o resumo financeiro usando o ViewModel do Presenter.
   */
  renderCart(cartViewModel, onDecreaseItemClick) {
    this.promoBannerEl.textContent = cartViewModel.promoHint;
    this.subtotalEl.textContent = cartViewModel.subtotalFormatted;
    this.discountEl.textContent = cartViewModel.discountFormatted;
    this.shippingEl.textContent = cartViewModel.shippingFormatted;
    this.totalEl.textContent = cartViewModel.totalFormatted;

    if (cartViewModel.isEmpty) {
      this.cartItemsContainer.innerHTML = '<p class="empty-cart">Seu carrinho está vazio.</p>';
      return;
    }

    this.cartItemsContainer.innerHTML = '';
    for (const item of cartViewModel.items) {
      const row = document.createElement('div');
      row.className = 'cart-row';
      row.innerHTML = `
        <div class="cart-row-info">
          <strong>${item.name}</strong>
          <small>${item.quantity}x ${item.unitPriceFormatted} = ${item.lineTotalFormatted}</small>
        </div>
        <button class="btn-remove" title="Remover 1 unidade">-1</button>
      `;
      row.querySelector('.btn-remove').addEventListener('click', () => onDecreaseItemClick(item.id));
      this.cartItemsContainer.appendChild(row);
    }
  }

  bindCheckoutSubmit(onSubmitHandler) {
    this.checkoutForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const customerName = document.getElementById('customer-name').value;
      const customerEmail = document.getElementById('customer-email').value;
      const paymentMethod = document.getElementById('payment-method').value;

      await onSubmitHandler({ customerName, customerEmail, paymentMethod });
    });
  }

  showSuccessReceipt(receiptViewModel) {
    this.feedbackBox.className = 'feedback-box feedback-success';
    this.feedbackBox.innerHTML = `
      <h4>✅ Pedido Confirmado (${receiptViewModel.orderId})</h4>
      <p><strong>Cliente:</strong> ${receiptViewModel.customerName}</p>
      <p><strong>Transação:</strong> <code>${receiptViewModel.transactionId}</code></p>
      <p><strong>Desconto Aplicado:</strong> ${receiptViewModel.discountFormatted} | <strong>Frete:</strong> ${receiptViewModel.shippingFormatted}</p>
      <p><strong>Total Pago:</strong> ${receiptViewModel.totalFormatted}</p>
    `;
  }

  showError(errorMessage) {
    this.feedbackBox.className = 'feedback-box feedback-error';
    this.feedbackBox.innerHTML = `
      <h4>⚠️ Violação de Regra de Negócio / Erro</h4>
      <p>${errorMessage}</p>
    `;
  }
}
