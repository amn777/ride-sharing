package com.ridesharing.rideservice.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CompleteRideRequest {
    @NotNull private Double distanceKm;
    @NotNull private Integer durationMinutes;
}
