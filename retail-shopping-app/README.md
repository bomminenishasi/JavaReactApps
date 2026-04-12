# SuperMarketStore

A full-stack e-commerce platform built with a microservices architecture. Customers can browse products, manage a shopping cart (without signing in), and place orders through a modern React frontend backed by Spring Boot microservices.

---

## Architecture Overview

```
Browser (React + Redux)
        │
        ▼  GraphQL (HTTP/WS)
  graphql-bff  (:8081)          ← Spring Boot WebFlux — single GraphQL API for the frontend
        │
        ├──► user-service        (:8082)  — registration, login, JWT auth
        ├──► product-service     (:8083)  — product catalogue, categories, search
        ├──► order-service       (:8084)  — order creation & management
        ├──► cart-service        (:8085)  — persistent user cart
        ├──► payment-service     (:8086)  — payment processing
        ├──► inventory-service   (:8087)  — stock tracking
        └──► notification-service(:8089)  — email/event notifications

Infrastructure
  ├── Oracle XE 21c             (:1521)  — primary relational database
  ├── Apache Kafka + Zookeeper  (:9092)  — async event bus
  ├── Splunk                    (:8000)  — centralised logging & monitoring
  └── API Gateway               (:8080)  — Kong/custom gateway (optional)
```

**Frontend** — React 18, TypeScript, Apollo Client, Redux Toolkit, Tailwind CSS  
**Backend** — Spring Boot 3.2, Spring for GraphQL, Spring WebFlux (reactive), Spring Security + JWT  
**Database** — Oracle Database 21c XE (one schema per service)  
**Messaging** — Apache Kafka for order/inventory/notification events  
**Observability** — Splunk with HEC (HTTP Event Collector)

---

## Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Docker Desktop | 24+ | Required. Enable WSL2 backend on Windows |
| Docker Compose | v2 | Bundled with Docker Desktop |
| Git | any | To clone the repo |
| Node.js | 18+ | Only needed for local frontend dev (optional) |
| Java JDK | 17+ | Only needed for local backend dev (optional) |

---

## Quick Start (Docker)

### 1. Clone

```bash
git clone <repo-url>
cd retail-shopping-app
```

### 2. Pull the Oracle image

The Oracle XE image requires a one-time login to the Oracle Container Registry:

```bash
docker login container-registry.oracle.com
# Use your Oracle account (free registration at oracle.com)
```

### 3. Start everything

```bash
docker compose up -d --build
```

First boot takes 5–10 minutes because:
- Oracle XE initialises its data files
- Each Spring Boot service waits for the database to be ready
- Kafka topics are auto-created on first use

### 4. Verify services are up

```bash
docker compose ps
```

All services should show `Up` (healthy). Oracle may take 2–3 minutes longer than the rest.

### 5. Open the app

| URL | Description |
|---|---|
| http://localhost:3000 | React frontend |
| http://localhost:8081/graphiql | GraphQL playground |
| http://localhost:8090 | Kafka UI |
| http://localhost:8000 | Splunk (admin / SplunkPass123) |

---

## Service Port Reference

| Service | Port |
|---|---|
| Frontend | 3000 |
| API Gateway | 8080 |
| GraphQL BFF | 8081 |
| User Service | 8082 |
| Product Service | 8083 |
| Order Service | 8084 |
| Cart Service | 8085 |
| Payment Service | 8086 |
| Inventory Service | 8087 |
| Notification Service | 8089 |
| Kafka UI | 8090 |
| Oracle DB | 1521 |
| Splunk Web | 8000 |
| Splunk HEC | 8088 |

---

## Database Schemas

Each microservice owns its own Oracle schema (schema-per-service pattern):

| Schema | Password | Used by |
|---|---|---|
| `retail_user` | RetailPass123 | user-service |
| `retail_product` | RetailPass123 | product-service |
| `retail_order` | RetailPass123 | order-service |
| `retail_cart` | RetailPass123 | cart-service |
| `retail_payment` | RetailPass123 | payment-service |
| `retail_inventory` | RetailPass123 | inventory-service |

Schemas and tables are created automatically on first startup via `infrastructure/oracle/init/`.

---

## Environment Variables

Key variables are set in `docker-compose.yml`. Override them with a `.env` file or by editing the compose file directly.

| Variable | Default | Description |
|---|---|---|
| `ORACLE_PWD` | RetailPass123 | Oracle SYS/SYSTEM password |
| `SPLUNK_HEC_TOKEN` | retail-hec-token-12345 | Splunk HTTP Event Collector token |
| `SPLUNK_PASSWORD` | SplunkPass123 | Splunk web UI password |
| `REACT_APP_GRAPHQL_URL` | http://localhost:8081/graphql | GraphQL endpoint used by the frontend |

---

## Project Structure

```
retail-shopping-app/
├── docker-compose.yml
├── README.md
├── END_USER_GUIDE.md
│
├── frontend/                     # React TypeScript app
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/           # Header, Footer, Navigation
│   │   │   ├── product/          # ProductCard, ProductList
│   │   │   ├── cart/             # CartItem, CartSummary
│   │   │   ├── order/            # OrderCard, OrderDetail
│   │   │   └── auth/             # ProtectedRoute
│   │   ├── pages/                # Route-level page components
│   │   ├── graphql/              # Apollo queries & mutations
│   │   ├── store/                # Redux store + slices
│   │   │   └── slices/
│   │   │       ├── authSlice.ts
│   │   │       ├── cartSlice.ts
│   │   │       └── guestCartSlice.ts   # Guest cart (localStorage)
│   │   └── App.tsx
│   ├── Dockerfile
│   └── package.json
│
├── backend/
│   ├── graphql-bff/              # GraphQL API gateway (WebFlux, reactive)
│   ├── user-service/             # Auth, JWT, user management
│   ├── product-service/          # Catalogue, categories, search
│   ├── cart-service/             # Persistent cart per user
│   ├── order-service/            # Orders, line items, status
│   ├── payment-service/          # Payment processing
│   ├── inventory-service/        # Stock levels
│   ├── notification-service/     # Kafka consumer, sends emails
│   ├── api-gateway/              # Request routing
│   └── common/                   # Shared DTOs, utilities
│
└── infrastructure/
    ├── oracle/
    │   └── init/                 # SQL scripts run at DB startup
    ├── kafka/                    # Kafka configuration
    └── splunk/                   # Splunk configuration
```

---

## Key Features

### Guest Shopping
Customers can browse all products and add items to a cart without an account. The guest cart is stored in `localStorage` via Redux and survives page refreshes.

### Cart Merge on Login
When a guest signs in or registers, their cart items are automatically merged into their account's server-side cart.

### GraphQL API
All frontend-to-backend communication goes through a single GraphQL endpoint (`/graphql`). The GraphQL BFF (Backend for Frontend) orchestrates calls to individual microservices.

### Reactive Backend
The `graphql-bff` service is built on Spring WebFlux. All service calls are non-blocking (`Mono`/`Flux`), allowing high throughput without thread blocking.

### Event-Driven Notifications
Order and inventory events are published to Kafka topics. The `notification-service` consumes these events and sends email/push notifications.

### Centralised Logging
All services ship logs to Splunk via HEC. The Splunk dashboard is available at `http://localhost:8000`.

---

## Development

### Running a single service locally

```bash
# Example: run product-service outside Docker
cd backend/product-service
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

Set `local` profile properties in `src/main/resources/application-local.properties` to point to the Dockerised Oracle and Kafka.

### Running the frontend locally

```bash
cd frontend
npm install
npm start
# Opens http://localhost:3000
```

Set `REACT_APP_GRAPHQL_URL=http://localhost:8081/graphql` in a `.env.local` file.

### Rebuilding a single Docker service

```bash
docker compose build product-service
docker compose up -d product-service
```

### Viewing logs

```bash
# All services
docker compose logs -f

# Single service
docker compose logs -f graphql-bff
```

---

## GraphQL API

The GraphQL playground is available at **http://localhost:8081/graphiql** (development only).

### Example Queries

```graphql
# Browse products
query {
  products(page: 0, size: 20) {
    content {
      id
      name
      price
      images
      category { name }
    }
    totalElements
  }
}

# Filter by category
query {
  products(categoryId: "Electronics", page: 0, size: 20) {
    content { id name price }
  }
}

# Product detail
query {
  product(id: "1") {
    id name description price stockQuantity images
  }
}
```

### Example Mutations

```graphql
# Register
mutation {
  register(input: {
    firstName: "Jane"
    lastName: "Doe"
    email: "jane@example.com"
    password: "secret123"
  }) {
    token
    user { id firstName email }
  }
}

# Add to cart (requires Authorization: Bearer <token>)
mutation {
  addToCart(userId: "1", productId: "42", quantity: 2) {
    id itemCount totalAmount
  }
}
```

---

## Stopping the Application

```bash
# Stop all containers (data is preserved)
docker compose down

# Stop and remove all data volumes (full reset)
docker compose down -v
```

---

## Troubleshooting

### Oracle takes too long to start
Oracle XE can take 3–5 minutes on first boot. Check progress with:
```bash
docker logs -f oracle-db
```
Wait for: `DATABASE IS READY TO USE!`

### A service fails to connect to the database
The Spring services use `depends_on`, but Oracle's health check may not be ready yet. Restart the failing service:
```bash
docker compose restart product-service
```

### Frontend shows "Failed to fetch"
Ensure `graphql-bff` is running and CORS is enabled:
```bash
docker compose ps graphql-bff
docker logs graphql-bff | tail -30
```

### Port already in use
Stop any local processes using the conflicting port, or change the host port in `docker-compose.yml`:
```yaml
ports:
  - "3001:3000"   # Change left side only
```

### Full reset
```bash
docker compose down -v
docker compose up -d --build
```

---

## Testing

### Unit & Integration Tests (Backend)

```bash
cd backend/product-service
./mvnw test
```

### End-to-End Tests (Cypress)

```bash
cd frontend
npx cypress open          # Interactive mode
npx cypress run           # Headless CI mode
```

---

## CI/CD

A Jenkins pipeline configuration is available in the `jenkins/` directory. It:
1. Builds all backend services with Maven
2. Runs unit tests
3. Builds Docker images
4. Pushes to a container registry
5. Deploys via `docker compose`

---

## Contributing

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make changes and add tests
3. Run tests: `./mvnw test` (backend) and `npx cypress run` (E2E)
4. Open a pull request against `master`

---

## License

This project is for demonstration and educational purposes.
