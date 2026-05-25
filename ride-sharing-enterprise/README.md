# 🚗 RideWave — Enterprise Spring Boot Microservices

Production-grade ride sharing backend with Java 17, Spring Boot 3.2, Kafka, Redis, PostgreSQL, MongoDB, Docker.

## Architecture

```
                    ┌─────────────────────────────────────┐
                    │         React Frontend :3000          │
                    └──────────────┬──────────────────────┘
                                   │
                    ┌──────────────▼──────────────────────┐
                    │    API Gateway :8080 (JWT Auth)       │
                    └──┬──────┬──────┬──────┬─────────────┘
                       │      │      │      │
              ┌────────▼──┐ ┌─▼───┐ ┌▼────┐ ┌▼──────────┐
              │   User    │ │Drive│ │Ride │ │  Rating   │
              │  :8081    │ │:8082│ │:8083│ │  :8088    │
              │ PostgreSQL│ │PG+R │ │Mongo│ │  MongoDB  │
              └───────────┘ └──┬──┘ └──┬──┘ └───────────┘
                               │       │
                    ┌──────────▼───────▼──────────────────┐
                    │          Apache Kafka                  │
                    │  ride.requested | ride.accepted        │
                    │  ride.completed | driver.location      │
                    └──────────┬──────────────┬────────────┘
                               │              │
                    ┌──────────▼───┐  ┌───────▼────────────┐
                    │  Matching    │  │   Notification     │
                    │  :8085       │  │   :8086            │
                    │  Redis Geo   │  │   Push/SMS         │
                    └──────────────┘  └────────────────────┘
```

## Tech Stack

| Component     | Technology                          |
|--------------|-------------------------------------|
| Language      | Java 17                             |
| Framework     | Spring Boot 3.2 + Spring Cloud      |
| Service Mesh  | Eureka + Spring Cloud Gateway       |
| Messaging     | Apache Kafka                        |
| Cache + Geo   | Redis (GEORADIUS for matching)      |
| DB (Users)    | PostgreSQL 16                       |
| DB (Rides)    | MongoDB 7                           |
| Container     | Docker + Docker Compose             |

## Services & Ports

| Service              | Port |
|----------------------|------|
| Eureka Server        | 8761 |
| API Gateway          | 8080 |
| User Service         | 8081 |
| Driver Service       | 8082 |
| Ride Service         | 8083 |
| Matching Service     | 8085 |
| Notification Service | 8086 |
| Payment Service      | 8087 |
| Rating Service       | 8088 |

## Quick Start

```bash
# Clone
git clone https://github.com/YOUR_USERNAME/ride-sharing-java.git
cd ride-sharing-java

# Configure (optional — defaults work for local)
cp .env .env.local

# Start everything
make up

# Check status
make ps

# View logs
make logs
make logs s=ride-service
```

**First boot:** 3–5 min (Maven downloads dependencies inside Docker)

## API Endpoints

### Auth
```
POST /api/v1/auth/register
POST /api/v1/auth/login
```

### Rides
```
POST   /api/v1/rides/request
GET    /api/v1/rides/{id}
GET    /api/v1/rides/my-rides
POST   /api/v1/rides/{id}/start?otp=1234
POST   /api/v1/rides/{id}/complete
POST   /api/v1/rides/{id}/cancel
```

### Drivers
```
POST /api/v1/drivers/go-online?lat=28.6&lng=77.2
POST /api/v1/drivers/go-offline
POST /api/v1/drivers/location?lat=28.6&lng=77.2
```

## Kafka Topics

| Topic                    | Producer       | Consumers                     |
|--------------------------|----------------|-------------------------------|
| `ride.requested`         | ride-service   | matching-service              |
| `ride.accepted`          | matching-service | ride-service, notification  |
| `ride.completed`         | ride-service   | payment-service, rating, notif|
| `ride.cancelled`         | ride-service   | notification-service          |
| `driver.location.update` | driver-service | matching-service              |

## Fare Calculation

| Vehicle | Base | Per KM |
|---------|------|--------|
| BIKE    | ₹10  | ₹7     |
| AUTO    | ₹15  | ₹10    |
| CAR     | ₹20  | ₹13    |
| SUV     | ₹30  | ₹18    |

## Project Structure

```
ride-sharing-java/
├── pom.xml                    ← Parent POM (multi-module)
├── common/                    ← Shared: Events, DTOs, Exceptions
├── eureka-server/
├── api-gateway/               ← JWT auth + routing
├── user-service/              ← Auth, PostgreSQL
├── driver-service/            ← Location, Redis Geo
├── ride-service/              ← Booking lifecycle, MongoDB
├── matching-service/          ← Redis GEORADIUS matching
├── notification-service/      ← Kafka consumer
├── payment-service/           ← Fare recording
├── rating-service/            ← Driver/Rider ratings
├── scripts/init-db.sql
├── docker-compose.yml
├── Makefile
└── .env
```
