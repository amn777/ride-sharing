package com.ridesharing.paymentservice.consumer;

import com.ridesharing.common.events.RideEvents;
import com.ridesharing.paymentservice.model.Payment;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class PaymentConsumer {

    private final EntityManager em;

    @Transactional
    @KafkaListener(topics = RideEvents.TOPIC_RIDE_COMPLETED, groupId = "payment-service")
    public void onRideCompleted(@Payload RideEvents.RideCompletedEvent event) {
        Payment payment = Payment.builder()
                .rideId(event.getRideId())
                .riderId(event.getRiderId())
                .driverId(event.getDriverId())
                .amount(event.getFare())
                .build();
        em.persist(payment);
        log.info("[PAYMENT] Rs.{} recorded for ride: {}", event.getFare(), event.getRideId());
    }
}
