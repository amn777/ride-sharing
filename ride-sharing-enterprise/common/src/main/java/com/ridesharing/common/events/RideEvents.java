package com.ridesharing.common.events;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * Shared Kafka event classes used across all microservices.
 * All topics defined as constants here for consistency.
 */
public final class RideEvents {

    // ── Kafka Topic Names ────────────────────────────────────────────────────
    public static final String TOPIC_RIDE_REQUESTED         = "ride.requested";
    public static final String TOPIC_RIDE_ACCEPTED          = "ride.accepted";
    public static final String TOPIC_RIDE_STARTED           = "ride.started";
    public static final String TOPIC_RIDE_COMPLETED         = "ride.completed";
    public static final String TOPIC_RIDE_CANCELLED         = "ride.cancelled";
    public static final String TOPIC_RIDE_NO_DRIVER         = "ride.no-driver";
    public static final String TOPIC_DRIVER_LOCATION_UPDATE = "driver.location.update";

    private RideEvents() {}

    // ── Event Payloads ───────────────────────────────────────────────────────

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class RideRequestedEvent implements Serializable {
        private String rideId;
        private String riderId;
        private double pickupLat;
        private double pickupLng;
        private String pickupAddress;
        private double dropLat;
        private double dropLng;
        private String dropAddress;
        private String vehicleType;
        @Builder.Default
        private LocalDateTime timestamp = LocalDateTime.now();
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class RideAcceptedEvent implements Serializable {
        private String rideId;
        private String riderId;
        private String driverId;
        private double driverLat;
        private double driverLng;
        @Builder.Default
        private LocalDateTime timestamp = LocalDateTime.now();
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class RideCompletedEvent implements Serializable {
        private String rideId;
        private String riderId;
        private String driverId;
        private Double fare;
        private Double distanceKm;
        private Integer durationMinutes;
        @Builder.Default
        private LocalDateTime timestamp = LocalDateTime.now();
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class RideCancelledEvent implements Serializable {
        private String rideId;
        private String riderId;
        private String driverId;
        private String cancelledBy;
        private String reason;
        @Builder.Default
        private LocalDateTime timestamp = LocalDateTime.now();
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class DriverLocationEvent implements Serializable {
        private String driverId;
        private double lat;
        private double lng;
        private String vehicleType;
        private boolean available;
        @Builder.Default
        private LocalDateTime timestamp = LocalDateTime.now();
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class NoDriverFoundEvent implements Serializable {
        private String rideId;
        private String riderId;
        @Builder.Default
        private LocalDateTime timestamp = LocalDateTime.now();
    }
}
