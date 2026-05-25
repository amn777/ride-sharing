package com.ridesharing.rideservice.service;

import com.ridesharing.common.events.RideEvents;
import com.ridesharing.common.exception.BusinessException;
import com.ridesharing.common.exception.ResourceNotFoundException;
import com.ridesharing.rideservice.dto.CompleteRideRequest;
import com.ridesharing.rideservice.dto.RideRequest;
import com.ridesharing.rideservice.model.Ride;
import com.ridesharing.rideservice.repository.RideRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Slf4j
@Service
@RequiredArgsConstructor
public class RideService {

    private final RideRepository rideRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    public Ride requestRide(String riderId, RideRequest req) {
        String otp = String.format("%04d", new Random().nextInt(10000));

        Ride ride = Ride.builder()
                .riderId(riderId)
                .status(Ride.RideStatus.REQUESTED)
                .pickupLocation(new Ride.Location(req.getPickupLat(), req.getPickupLng(), req.getPickupAddress()))
                .dropLocation(new Ride.Location(req.getDropLat(), req.getDropLng(), req.getDropAddress()))
                .vehicleType(req.getVehicleType())
                .otp(otp)
                .estimatedFare(estimateFare(req.getVehicleType()))
                .build();

        ride = rideRepository.save(ride);

        kafkaTemplate.send(RideEvents.TOPIC_RIDE_REQUESTED,
            ride.getId(),
            RideEvents.RideRequestedEvent.builder()
                .rideId(ride.getId())
                .riderId(riderId)
                .pickupLat(req.getPickupLat()).pickupLng(req.getPickupLng())
                .pickupAddress(req.getPickupAddress())
                .dropLat(req.getDropLat()).dropLng(req.getDropLng())
                .dropAddress(req.getDropAddress())
                .vehicleType(req.getVehicleType())
                .build());

        log.info("Ride requested: {} by rider: {}", ride.getId(), riderId);
        return ride;
    }

    public Ride assignDriver(String rideId, String driverId) {
        Ride ride = findById(rideId);
        ride.setDriverId(driverId);
        ride.setStatus(Ride.RideStatus.DRIVER_ASSIGNED);
        ride.setAcceptedAt(LocalDateTime.now());
        return rideRepository.save(ride);
    }

    public Ride startRide(String rideId, String driverId, String otp) {
        Ride ride = findById(rideId);
        if (!ride.getDriverId().equals(driverId)) throw new BusinessException("Driver mismatch");
        if (!ride.getOtp().equals(otp)) throw new BusinessException("Invalid OTP");
        ride.setStatus(Ride.RideStatus.ONGOING);
        ride.setStartedAt(LocalDateTime.now());
        return rideRepository.save(ride);
    }

    public Ride completeRide(String rideId, String driverId, CompleteRideRequest req) {
        Ride ride = findById(rideId);
        if (!ride.getDriverId().equals(driverId)) throw new BusinessException("Driver mismatch");
        if (ride.getStatus() != Ride.RideStatus.ONGOING) throw new BusinessException("Ride is not ongoing");

        double fare = calculateFare(req.getDistanceKm(), ride.getVehicleType());
        ride.setStatus(Ride.RideStatus.COMPLETED);
        ride.setCompletedAt(LocalDateTime.now());
        ride.setDistanceKm(req.getDistanceKm());
        ride.setDurationMinutes(req.getDurationMinutes());
        ride.setActualFare(fare);
        ride = rideRepository.save(ride);

        kafkaTemplate.send(RideEvents.TOPIC_RIDE_COMPLETED, rideId,
            RideEvents.RideCompletedEvent.builder()
                .rideId(ride.getId()).riderId(ride.getRiderId()).driverId(driverId)
                .fare(fare).distanceKm(req.getDistanceKm()).durationMinutes(req.getDurationMinutes())
                .build());

        log.info("Ride completed: {} fare: Rs.{}", rideId, fare);
        return ride;
    }

    public Ride cancelRide(String rideId, String userId, String reason) {
        Ride ride = findById(rideId);
        if (ride.getStatus() == Ride.RideStatus.ONGOING || ride.getStatus() == Ride.RideStatus.COMPLETED)
            throw new BusinessException("Cannot cancel a " + ride.getStatus() + " ride");

        ride.setStatus(Ride.RideStatus.CANCELLED);
        ride.setCancelledAt(LocalDateTime.now());
        ride.setCancelReason(reason);
        ride = rideRepository.save(ride);

        kafkaTemplate.send(RideEvents.TOPIC_RIDE_CANCELLED, rideId,
            RideEvents.RideCancelledEvent.builder()
                .rideId(rideId).riderId(ride.getRiderId())
                .cancelledBy(userId).reason(reason).build());
        return ride;
    }

    public List<Ride> getRiderHistory(String riderId) {
        return rideRepository.findByRiderIdOrderByRequestedAtDesc(riderId);
    }

    public List<Ride> getDriverHistory(String driverId) {
        return rideRepository.findByDriverIdOrderByRequestedAtDesc(driverId);
    }

    public Ride findById(String id) {
        return rideRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ride", id));
    }

    private Double calculateFare(Double km, String type) {
        return switch (type) {
            case "BIKE" -> 10 + km * 7;
            case "AUTO" -> 15 + km * 10;
            case "SUV"  -> 30 + km * 18;
            default     -> 20 + km * 13; // CAR
        };
    }

    private Double estimateFare(String type) {
        return switch (type) {
            case "BIKE" -> 50.0;
            case "AUTO" -> 80.0;
            case "SUV"  -> 200.0;
            default     -> 120.0;
        };
    }
}
