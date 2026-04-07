# SecureBank — Full-Stack Banking Application

A production-grade banking application built with **Spring Boot 3**, **React 18 + TypeScript**, **Oracle Database**, and **Apache Kafka**.

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Java 17, Spring Boot 3.2, Spring Security, Spring Data JPA |
| Frontend | React 18, TypeScript (ES6+), Redux Toolkit, MUI, React Router v6 |
| Database | Oracle XE 21c |
| Messaging | Apache Kafka + Zookeeper |
| Auth | JWT (access token 15min + refresh token 7d) |
| Infrastructure | Docker, Docker Compose, GitHub Actions CI |

## Features

- **Auth**: Register, Login (JWT), Token Refresh, Logout, Forgot Password
- **Dashboard**: Account balance overview, charts, quick actions
- **Accounts**: Create Savings/Checking accounts, view details
- **Transactions**: Transfer, Deposit, Withdraw with real-time Kafka processing
- **Payments**: Schedule bill payments, cancel scheduled payments
- **Profile**: Edit profile, change password
- **Admin**: User management panel (ROLE_ADMIN only)

## Project Structure

```
banking-app/
├── backend/              # Spring Boot backend
│   ├── src/main/java/com/banking/
│   │   ├── auth/         # JWT auth, login, register, refresh
│   │   ├── accounts/     # Account management
│   │   ├── transactions/ # Transactions + Kafka integration
│   │   ├── payments/     # Bill payments
│   │   ├── users/        # User profile
│   │   ├── admin/        # Admin endpoints
│   │   └── config/       # Security, Kafka, OpenAPI config
│   └── Dockerfile
├── frontend/             # React TypeScript frontend
│   ├── src/
│   │   ├── app/          # Redux store + typed hooks
│   │   ├── features/     # auth, accounts, transactions, payments, users slices
│   │   ├── pages/        # LoginPage, Dashboard, Accounts, Transactions, etc.
│   │   ├── components/   # AppLayout, Sidebar, Header, ProtectedRoute
│   │   ├── services/     # Axios instance with JWT interceptor
│   │   └── types/        # TypeScript interfaces
│   └── Dockerfile
├── docker/
│   └── init.sql          # Oracle schema
├── docker-compose.yml    # Full stack
└── .github/workflows/ci.yml
```

## Quick Start

### Prerequisites
- Docker Desktop
- Git

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd banking-app
```

### 2. Start all services
```bash
docker-compose up -d
```

Wait ~2 minutes for Oracle to initialize on first run.

### 3. Access the application
| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8080 |
| Swagger UI | http://localhost:8080/swagger-ui.html |
| Kafka UI | http://localhost:8090 |

### 4. Register and login
1. Open http://localhost:3000/register
2. Create an account
3. Login and start banking!

## Development Setup

### Backend (local, without Docker)
```bash
cd backend

# Start only Oracle + Kafka via Docker
docker-compose up -d oracle-db zookeeper kafka

# Run Spring Boot
./mvnw spring-boot:run
```

### Frontend (local)
```bash
cd frontend
npm install
npm start
```

## API Reference

Full interactive docs at: http://localhost:8080/swagger-ui.html

### Auth Endpoints
| Method | Path | Description |
|---|---|---|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login → JWT + refresh token |
| POST | /api/auth/refresh | Refresh access token |
| POST | /api/auth/logout | Revoke refresh token |
| POST | /api/auth/forgot-password | Password reset |

### Core Endpoints
| Method | Path | Description |
|---|---|---|
| GET/POST | /api/accounts | List / create accounts |
| GET | /api/accounts/{id} | Account detail |
| GET | /api/transactions | Transaction history |
| POST | /api/transactions/transfer | Fund transfer |
| POST | /api/transactions/deposit | Deposit |
| POST | /api/transactions/withdraw | Withdrawal |
| GET/POST | /api/payments | List / schedule payments |
| DELETE | /api/payments/{id} | Cancel payment |
| GET/PUT | /api/users/profile | View / update profile |
| PUT | /api/users/change-password | Change password |

## Kafka Topics

| Topic | Purpose |
|---|---|
| `txn-initiated` | Published when a transaction is created |
| `txn-completed` | Published when a transaction succeeds |
| `txn-failed` | Published when a transaction fails |
| `payment-scheduled` | Published when a bill payment is scheduled |

## Environment Variables

### Backend
| Variable | Default | Description |
|---|---|---|
| SPRING_DATASOURCE_URL | jdbc:oracle:thin:@localhost:1521/XEPDB1 | Oracle JDBC URL |
| SPRING_DATASOURCE_USERNAME | banking_user | DB username |
| SPRING_DATASOURCE_PASSWORD | BankingUser123 | DB password |
| SPRING_KAFKA_BOOTSTRAP_SERVERS | localhost:9092 | Kafka brokers |
| JWT_SECRET | (change in prod!) | JWT signing key |
| JWT_EXPIRATION_MS | 900000 | Access token TTL (15min) |
| JWT_REFRESH_EXPIRATION_MS | 604800000 | Refresh token TTL (7 days) |

### Frontend
| Variable | Default |
|---|---|
| REACT_APP_API_URL | http://localhost:8080 |

## Security Notes

- JWT secret **must** be changed in production — use a strong random 256-bit key
- All monetary values use `BigDecimal` (no floating point)
- Fund transfers use pessimistic database locking to prevent race conditions
- Refresh tokens are stored in DB and can be revoked on logout
- All protected routes require a valid JWT

## License
MIT
