##  Estrutura de Pastas do Projeto

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

## Como Executar

Você não precisa instalar nenhum pacote (`npm install` não é necessário, pois usamos Node.js puro e ES Modules nativos para evitar falhas de rede durante a apresentação!).

### Terminal

```bash
node cleanArchitecture/backend/src/demo-cli.js
```

### Subindo o Servidor + Interface Gráfica

```bash
node cleanArchitecture/backend/src/main.js
```

