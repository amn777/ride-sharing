package com.ridesharing.rideservice.repository;

import com.ridesharing.rideservice.model.Ride;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface RideRepository extends MongoRepository<Ride, String> {
    List<Ride> findByRiderIdOrderByRequestedAtDesc(String riderId);
    List<Ride> findByDriverIdOrderByRequestedAtDesc(String driverId);
    List<Ride> findByStatus(Ride.RideStatus status);
}
