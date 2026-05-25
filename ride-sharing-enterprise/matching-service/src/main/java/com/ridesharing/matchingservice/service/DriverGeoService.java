package com.ridesharing.matchingservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.geo.*;
import org.springframework.data.redis.connection.RedisGeoCommands;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class DriverGeoService {

    private final RedisTemplate<String, String> redisTemplate;
    private static final String GEO_KEY  = "drivers:geo:";
    private static final double RADIUS_KM = 5.0;

    public void updateLocation(String driverId, double lat, double lng, String vehicleType) {
        redisTemplate.opsForGeo().add(GEO_KEY + vehicleType, new Point(lng, lat), driverId);
    }

    public void removeDriver(String driverId, String vehicleType) {
        redisTemplate.opsForGeo().remove(GEO_KEY + vehicleType, driverId);
    }

    public Optional<String> findNearest(double lat, double lng, String vehicleType) {
        var args = RedisGeoCommands.GeoRadiusCommandArgs.newGeoRadiusArgs()
                .includeDistance().sortAscending().limit(5);

        GeoResults<RedisGeoCommands.GeoLocation<String>> results =
                redisTemplate.opsForGeo().radius(
                        GEO_KEY + vehicleType,
                        new Circle(new Point(lng, lat), new Distance(RADIUS_KM, Metrics.KILOMETERS)),
                        args);

        if (results == null || results.getContent().isEmpty()) return Optional.empty();

        String nearest = results.getContent().get(0).getContent().getName();
        double dist    = results.getContent().get(0).getDistance().getValue();
        log.info("Nearest driver: {} at {:.2f}km", nearest, dist);
        return Optional.of(nearest);
    }
}
