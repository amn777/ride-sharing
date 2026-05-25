package com.ridesharing.rideservice.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RideRequest {
    @NotNull private Double pickupLat;
    @NotNull private Double pickupLng;
    @NotBlank private String pickupAddress;

    @NotNull private Double dropLat;
    @NotNull private Double dropLng;
    @NotBlank private String dropAddress;

    @NotBlank @Pattern(regexp = "BIKE|AUTO|CAR|SUV", message = "Invalid vehicle type")
    private String vehicleType;
}
