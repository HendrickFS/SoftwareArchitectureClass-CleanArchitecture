# 🏛️ E-Commerce Clean Architecture — Guia para Apresentação Acadêmica

Este projeto foi construído especificamente para demonstrar, de forma **didática, prática e sem dependências externas ocultas**, como aplicar a **Clean Architecture** (proposta por *Robert C. Martin / Uncle Bob*) tanto no **Backend** quanto no **Frontend** usando o domínio de um **E-Commerce**.

---

## 🎯 O Problema que a Clean Architecture Resolve

Em muitos projetos acadêmicos e comerciais tradicionais (MVC acoplado ou scripts procedurais):
1. **Regras de negócio ficam misturadas com HTTP e Banco de Dados:** O cálculo de desconto e a validação de estoque costumam ser escritos dentro da rota do Express (`app.post('/checkout', ...)`), misturados com queries SQL/Prisma.
2. **Testabilidade difícil:** Para testar se um desconto de 10% está funcionando, você é obrigado a subir um banco de dados e fazer uma requisição HTTP.
3. **Aprisionamento Tecnológico (Vendor Lock-in):** Trocar o banco de dados, o gateway de pagamento ou o framework web exige reescrever as regras de negócio.

---

## 🧭 As 4 Camadas e a Regra da Dependência (The Dependency Rule)

A regra de ouro da Clean Architecture é:
> **As setas de dependência do código-fonte só podem apontar para DENTRO (em direção às regras de alto nível).** Nenhuma camada interna pode saber o nome de nada que pertença a uma camada externa.

---

## 📂 Estrutura de Pastas do Projeto

```text
cleanArchitecture/
├── backend/
│   ├── package.json
│   └── src/
│       ├── domain/                    # [Camada 1] Coração do negócio (0 dependências externas)
│       │   ├── entities/
│       │   │   ├── Product.js         # Protege invariantes (estoque nunca fica negativo)
│       │   │   └── Order.js           # Políticas de frete grátis (>= R$200) e desconto 10% (>= R$500)
│       │   └── errors/
│       │       └── DomainError.js     # Erro semântico de negócio (não conhece status HTTP 400/500!)
│       ├── application/               # [Camada 2] Orquestração de Casos de Uso + Portas
│       │   ├── ports/                 # Contratos para Inversão de Dependência (DIP)
│       │   │   ├── ProductRepositoryPort.js
│       │   │   ├── OrderRepositoryPort.js
│       │   │   └── PaymentGatewayPort.js
│       │   └── use-cases/
│       │       ├── ListProductsUseCase.js
│       │       └── CheckoutOrderUseCase.js # Reserva estoque, cobra pagamento e faz Rollback se falhar
│       ├── adapters/                  # [Camada 3] Tradutores entre o mundo externo e a aplicação
│       │   ├── controllers/
│       │   │   └── EcommerceHttpController.js # Traduz JSON/HTTP <-> Caso de Uso (DomainError -> HTTP 422)
│       │   └── gateways/
│       │       └── FakePaymentGateway.js      # Implementa PaymentGatewayPort
│       ├── infrastructure/            # [Camada 4] Detalhes técnicos (Banco e Servidor Web)
│       │   ├── database/
│       │   │   └── InMemoryDatabase.js        # Implementa os Ports de Repositório
│       │   └── http/
│       │       └── HttpServer.js              # Servidor HTTP nativo do Node.js
│       ├── main.js                    # Composition Root (Injeção de Dependências)
│       └── demo-cli.js                # Prova arquitetural: roda o sistema no Terminal SEM HTTP!
│
└── frontend/
    ├── index.html                     # Estrutura visual + Painel de Raio-X Arquitetural
    └── src/
        ├── domain/                    # [Camada 1] Entidade Cart.js (cálculos e limites no cliente)
        ├── application/               # [Camada 2] LoadCatalogUseCase, PlaceOrderUseCase e EcommerceApiPort
        ├── adapters/                  # [Camada 3] StorePresenter (ViewModel) e FetchEcommerceApiGateway
        ├── infrastructure/            # [Camada 4] DomStoreView.js (Humble Object - único que toca no DOM)
        └── main.js                    # Composition Root do Frontend
```

---

## 🚀 Como Executar

Você não precisa instalar nenhum pacote (`npm install` não é necessário, pois usamos Node.js puro e ES Modules nativos para evitar falhas de rede durante a apresentação!).

### Terminal

```bash
node cleanArchitecture/backend/src/demo-cli.js
```

### Subindo o Servidor + Interface Gráfica

```bash
node cleanArchitecture/backend/src/main.js
```

