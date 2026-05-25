package com.ridesharing.notificationservice.consumer;

import com.ridesharing.common.events.RideEvents;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class NotificationConsumer {

    @KafkaListener(topics = RideEvents.TOPIC_RIDE_ACCEPTED, groupId = "notification-service")
    public void onRideAccepted(@Payload RideEvents.RideAcceptedEvent event) {
        log.info("[NOTIFY] Rider {} - Driver {} is on the way! Ride: {}",
            event.getRiderId(), event.getDriverId(), event.getRideId());
        // TODO: FCM push / Twilio SMS integration here
        sendPushNotification(event.getRiderId(), "Driver Found!", "Your driver is on the way.");
    }

    @KafkaListener(topics = RideEvents.TOPIC_RIDE_COMPLETED, groupId = "notification-service")
    public void onRideCompleted(@Payload RideEvents.RideCompletedEvent event) {
        log.info("[NOTIFY] Ride {} completed - Fare: Rs.{}", event.getRideId(), event.getFare());
        sendPushNotification(event.getRiderId(), "Ride Complete!", "Fare: Rs." + event.getFare());
        sendPushNotification(event.getDriverId(), "Ride Complete!", "You earned Rs." + event.getFare());
    }

    @KafkaListener(topics = RideEvents.TOPIC_RIDE_CANCELLED, groupId = "notification-service")
    public void onRideCancelled(@Payload RideEvents.RideCancelledEvent event) {
        log.info("[NOTIFY] Ride {} cancelled by {} - Reason: {}", event.getRideId(), event.getCancelledBy(), event.getReason());
        sendPushNotification(event.getRiderId(), "Ride Cancelled", event.getReason());
    }

    @KafkaListener(topics = RideEvents.TOPIC_RIDE_NO_DRIVER, groupId = "notification-service")
    public void onNoDriver(@Payload RideEvents.NoDriverFoundEvent event) {
        log.info("[NOTIFY] No driver found for rider: {}", event.getRiderId());
        sendPushNotification(event.getRiderId(), "No Drivers Available", "Please try again in a few minutes.");
    }

    private void sendPushNotification(String userId, String title, String body) {
        // Placeholder - integrate FCM/APNs here
        log.info("[PUSH] To: {} | {} - {}", userId, title, body);
    }
}
