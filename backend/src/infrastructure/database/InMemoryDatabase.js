/**
 * ============================================================================
 * CAMADA 4: INFRASTRUCTURE (Frameworks & Drivers - Banco de Dados)
 * Arquivo: InMemoryDatabase.js
 * ============================================================================
 *
 * CONCEITO ARQUITETURAL: O BANCO DE DADOS É UM DETALHE!
 * Robert C. Martin (Uncle Bob) afirma em "Clean Architecture":
 * "O banco de dados é um detalhe de implementação."
 *
 * Como nossas camadas internas dependem apenas de `ProductRepositoryPort` e
 * `OrderRepositoryPort`, podemos começar o projeto com um banco em memória
 * (`Map`) e, meses depois, criar um `PostgresProductRepository` sem alterar
 * UMA ÚNICA LINHA das pastas `domain/` ou `application/`!
 */

import { Product } from '../../domain/entities/Product.js';
import { ProductRepositoryPort } from '../../application/ports/ProductRepositoryPort.js';
import { OrderRepositoryPort } from '../../application/ports/OrderRepositoryPort.js';

export class InMemoryProductRepository extends ProductRepositoryPort {
  constructor() {
    super();
    /** @type {Map<string, Product>} */
    this.products = new Map();
    this.seedInitialCatalog();
  }

  /**
   * Popula o catálogo inicial de produtos para demonstração do E-commerce.
   */
  seedInitialCatalog() {
    const initialItems = [
      new Product({
        id: 'prod-1',
        name: 'Livro: Clean Architecture (Robert C. Martin)',
        price: 120.00,
        stock: 8,
        category: 'Livros',
      }),
      new Product({
        id: 'prod-2',
        name: 'Teclado Mecânico Programador Split',
        price: 450.00,
        stock: 4,
        category: 'Hardware',
      }),
      new Product({
        id: 'prod-3',
        name: 'Monitor Ultrawide 29" IPS',
        price: 1100.00,
        stock: 2,
        category: 'Hardware',
      }),
      new Product({
        id: 'prod-4',
        name: 'Caneca "It Works On My Machine"',
        price: 45.00,
        stock: 15,
        category: 'Acessórios',
      }),
    ];

    for (const item of initialItems) {
      this.products.set(item.id, item);
    }
  }

  async findAll() {
    // Retornamos clones das instâncias para simular o comportamento real de um
    // banco de dados (onde uma mutação em memória antes do `save()` não altera
    // o registro já salvo no disco).
    return Array.from(this.products.values()).map(
      (p) => new Product({ id: p.id, name: p.name, price: p.price, stock: p.stock, category: p.category })
    );
  }

  async findById(id) {
    const found = this.products.get(id);
    if (!found) return null;

    return new Product({
      id: found.id,
      name: found.name,
      price: found.price,
      stock: found.stock,
      category: found.category,
    });
  }

  async save(product) {
    this.products.set(
      product.id,
      new Product({
        id: product.id,
        name: product.name,
        price: product.price,
        stock: product.stock,
        category: product.category,
      })
    );
  }
}

export class InMemoryOrderRepository extends OrderRepositoryPort {
  constructor() {
    super();
    this.orders = [];
  }

  async save(order) {
    this.orders.push(order);
  }

  async findAll() {
    return [...this.orders];
  }
}
