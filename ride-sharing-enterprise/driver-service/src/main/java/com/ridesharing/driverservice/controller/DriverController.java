package com.ridesharing.driverservice.controller;

import com.ridesharing.common.events.RideEvents;
import com.ridesharing.common.exception.ResourceNotFoundException;
import com.ridesharing.common.response.ApiResponse;
import com.ridesharing.driverservice.model.Driver;
import com.ridesharing.driverservice.repository.DriverRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.geo.Point;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/drivers")
@RequiredArgsConstructor
public class DriverController {

    private final DriverRepository driverRepository;
    private final KafkaTemplate<String, Object> kafka;
    private final RedisTemplate<String, String> redisTemplate;

    @PostMapping("/go-online")
    public ResponseEntity<ApiResponse<String>> goOnline(
            @RequestHeader("X-User-Id") String userId,
            @RequestParam double lat, @RequestParam double lng) {

        Driver driver = driverRepository.findByUserId(UUID.fromString(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Driver profile not found"));

        driver.setOnline(true);
        driver.setAvailable(true);
        driverRepository.save(driver);

        publishLocation(driver, lat, lng, true);
        return ResponseEntity.ok(ApiResponse.success("You are now online!"));
    }

    @PostMapping("/go-offline")
    public ResponseEntity<ApiResponse<String>> goOffline(
            @RequestHeader("X-User-Id") String userId) {

        Driver driver = driverRepository.findByUserId(UUID.fromString(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Driver profile not found"));

        driver.setOnline(false);
        driver.setAvailable(false);
        driverRepository.save(driver);

        redisTemplate.opsForGeo().remove(
            "drivers:geo:" + driver.getVehicleType().name(),
            driver.getId().toString());

        publishLocation(driver, 0, 0, false);
        return ResponseEntity.ok(ApiResponse.success("You are now offline"));
    }

    @PostMapping("/location")
    public ResponseEntity<Void> updateLocation(
            @RequestHeader("X-User-Id") String userId,
            @RequestParam double lat, @RequestParam double lng) {

        driverRepository.findByUserId(UUID.fromString(userId)).ifPresent(driver -> {
            if (driver.isOnline()) publishLocation(driver, lat, lng, true);
        });
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{driverId}")
    public ResponseEntity<ApiResponse<Driver>> getDriver(@PathVariable UUID driverId) {
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new ResourceNotFoundException("Driver", driverId.toString()));
        return ResponseEntity.ok(ApiResponse.success(driver));
    }

    private void publishLocation(Driver d, double lat, double lng, boolean available) {
        kafka.send(RideEvents.TOPIC_DRIVER_LOCATION_UPDATE, d.getId().toString(),
            RideEvents.DriverLocationEvent.builder()
                .driverId(d.getId().toString())
                .lat(lat).lng(lng)
                .vehicleType(d.getVehicleType().name())
                .available(available)
                .build());
    }
}
