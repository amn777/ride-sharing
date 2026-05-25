package com.ridesharing.rideservice.model;

import lombok.*;
import org.springframework.data.annotation.*;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "rides")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Ride {

    @Id private String id;

    private String riderId;
    private String driverId;

    private Location pickupLocation;
    private Location dropLocation;

    @Builder.Default
    private RideStatus status = RideStatus.REQUESTED;

    private String vehicleType;
    private String otp;

    private Double estimatedFare;
    private Double actualFare;
    private Double distanceKm;
    private Integer durationMinutes;

    @CreatedDate  private LocalDateTime requestedAt;
    private LocalDateTime acceptedAt;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private LocalDateTime cancelledAt;
    private String cancelReason;

    @LastModifiedDate private LocalDateTime updatedAt;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Location {
        private double lat;
        private double lng;
        private String address;
    }

    public enum RideStatus {
        REQUESTED, SEARCHING_DRIVER, DRIVER_ASSIGNED,
        DRIVER_ARRIVED, ONGOING, COMPLETED, CANCELLED
    }

    public enum VehicleType { BIKE, AUTO, CAR, SUV }
}
