package com.ridesharing.paymentservice.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "payments")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Payment {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(nullable = false) private String rideId;
    @Column(nullable = false) private String riderId;
    @Column(nullable = false) private String driverId;
    @Column(nullable = false) private Double amount;
    @Builder.Default private String currency = "INR";
    @Builder.Default private String status = "SUCCESS";
    @Builder.Default private String method = "CASH";
    @CreationTimestamp private LocalDateTime createdAt;
}
