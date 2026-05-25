package com.ridesharing.matchingservice.consumer;

import com.ridesharing.common.events.RideEvents;
import com.ridesharing.matchingservice.service.DriverGeoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Component
@RequiredArgsConstructor
public class RideEventConsumer {

    private final DriverGeoService  geoService;
    private final KafkaTemplate<String, Object> kafka;
    private final RestTemplate      restTemplate;

    @KafkaListener(topics = RideEvents.TOPIC_RIDE_REQUESTED, groupId = "matching-service")
    public void onRideRequested(@Payload RideEvents.RideRequestedEvent event) {
        log.info("Matching driver for ride: {}", event.getRideId());

        geoService.findNearest(event.getPickupLat(), event.getPickupLng(), event.getVehicleType())
                .ifPresentOrElse(
                    driverId -> {
                        log.info("Driver {} matched for ride {}", driverId, event.getRideId());
                        try {
                            restTemplate.postForObject(
                                "http://ride-service/api/v1/rides/" + event.getRideId()
                                    + "/assign-driver?driverId=" + driverId,
                                null, Void.class);
                        } catch (Exception e) {
                            log.error("Failed to assign driver: {}", e.getMessage());
                        }
                        kafka.send(RideEvents.TOPIC_RIDE_ACCEPTED, event.getRideId(),
                            RideEvents.RideAcceptedEvent.builder()
                                .rideId(event.getRideId())
                                .riderId(event.getRiderId())
                                .driverId(driverId)
                                .build());
                    },
                    () -> {
                        log.warn("No driver found for ride: {}", event.getRideId());
                        kafka.send(RideEvents.TOPIC_RIDE_NO_DRIVER, event.getRideId(),
                            RideEvents.NoDriverFoundEvent.builder()
                                .rideId(event.getRideId())
                                .riderId(event.getRiderId())
                                .build());
                    }
                );
    }

    @KafkaListener(topics = RideEvents.TOPIC_DRIVER_LOCATION_UPDATE, groupId = "matching-service")
    public void onDriverLocation(@Payload RideEvents.DriverLocationEvent event) {
        if (event.isAvailable()) {
            geoService.updateLocation(event.getDriverId(), event.getLat(), event.getLng(), event.getVehicleType());
        } else {
            geoService.removeDriver(event.getDriverId(), event.getVehicleType());
        }
    }
}
