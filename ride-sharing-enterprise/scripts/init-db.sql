-- RideWave DB Initialization

CREATE TABLE IF NOT EXISTS users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(150) UNIQUE NOT NULL,
    phone       VARCHAR(20)  UNIQUE NOT NULL,
    password    VARCHAR(255) NOT NULL,
    role        VARCHAR(20)  NOT NULL DEFAULT 'RIDER',
    active      BOOLEAN      NOT NULL DEFAULT true,
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS drivers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID UNIQUE NOT NULL,
    vehicle_number  VARCHAR(20)  NOT NULL,
    vehicle_type    VARCHAR(10)  NOT NULL,
    license_number  VARCHAR(50)  NOT NULL,
    online          BOOLEAN NOT NULL DEFAULT false,
    available       BOOLEAN NOT NULL DEFAULT false,
    rating          DECIMAL(3,2) DEFAULT 5.0,
    total_rides     INT DEFAULT 0,
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ride_id     VARCHAR(50)   NOT NULL,
    rider_id    VARCHAR(50)   NOT NULL,
    driver_id   VARCHAR(50)   NOT NULL,
    amount      DECIMAL(10,2) NOT NULL,
    currency    VARCHAR(5)    NOT NULL DEFAULT 'INR',
    status      VARCHAR(20)   NOT NULL DEFAULT 'SUCCESS',
    method      VARCHAR(20)   NOT NULL DEFAULT 'CASH',
    created_at  TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email    ON users(email);
CREATE INDEX IF NOT EXISTS idx_drivers_user   ON drivers(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_ride  ON payments(ride_id);
