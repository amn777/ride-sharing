package com.ridesharing.rideservice.controller;

import com.ridesharing.common.response.ApiResponse;
import com.ridesharing.rideservice.dto.CompleteRideRequest;
import com.ridesharing.rideservice.dto.RideRequest;
import com.ridesharing.rideservice.model.Ride;
import com.ridesharing.rideservice.service.RideService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/rides")
@RequiredArgsConstructor
public class RideController {

    private final RideService rideService;

    @PostMapping("/request")
    public ResponseEntity<ApiResponse<Ride>> requestRide(
            @RequestHeader("X-User-Id") String riderId,
            @Valid @RequestBody RideRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Ride requested", rideService.requestRide(riderId, request)));
    }

    @PostMapping("/{rideId}/assign-driver")
    public ResponseEntity<ApiResponse<Ride>> assignDriver(
            @PathVariable String rideId, @RequestParam String driverId) {
        return ResponseEntity.ok(ApiResponse.success(rideService.assignDriver(rideId, driverId)));
    }

    @PostMapping("/{rideId}/start")
    public ResponseEntity<ApiResponse<Ride>> startRide(
            @PathVariable String rideId,
            @RequestHeader("X-User-Id") String driverId,
            @RequestParam String otp) {
        return ResponseEntity.ok(ApiResponse.success("Ride started", rideService.startRide(rideId, driverId, otp)));
    }

    @PostMapping("/{rideId}/complete")
    public ResponseEntity<ApiResponse<Ride>> completeRide(
            @PathVariable String rideId,
            @RequestHeader("X-User-Id") String driverId,
            @Valid @RequestBody CompleteRideRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Ride completed", rideService.completeRide(rideId, driverId, request)));
    }

    @PostMapping("/{rideId}/cancel")
    public ResponseEntity<ApiResponse<Ride>> cancelRide(
            @PathVariable String rideId,
            @RequestHeader("X-User-Id") String userId,
            @RequestParam(required = false, defaultValue = "Cancelled by user") String reason) {
        return ResponseEntity.ok(ApiResponse.success(rideService.cancelRide(rideId, userId, reason)));
    }

    @GetMapping("/{rideId}")
    public ResponseEntity<ApiResponse<Ride>> getRide(@PathVariable String rideId) {
        return ResponseEntity.ok(ApiResponse.success(rideService.findById(rideId)));
    }

    @GetMapping("/my-rides")
    public ResponseEntity<ApiResponse<List<Ride>>> myRides(@RequestHeader("X-User-Id") String riderId) {
        return ResponseEntity.ok(ApiResponse.success(rideService.getRiderHistory(riderId)));
    }

    @GetMapping("/driver-rides")
    public ResponseEntity<ApiResponse<List<Ride>>> driverRides(@RequestHeader("X-User-Id") String driverId) {
        return ResponseEntity.ok(ApiResponse.success(rideService.getDriverHistory(driverId)));
    }
}
