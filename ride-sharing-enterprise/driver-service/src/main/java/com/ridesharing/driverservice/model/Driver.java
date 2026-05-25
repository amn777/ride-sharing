package com.ridesharing.driverservice.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "drivers")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Driver {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private UUID userId;

    @Column(nullable = false)
    private String vehicleNumber;

    @Enumerated(EnumType.STRING)
    private VehicleType vehicleType;

    private String licenseNumber;

    @Builder.Default private boolean online    = false;
    @Builder.Default private boolean available = false;
    @Builder.Default private Double  rating    = 5.0;
    @Builder.Default private Integer totalRides = 0;

    @CreationTimestamp private LocalDateTime createdAt;

    public enum VehicleType { BIKE, AUTO, CAR, SUV }
}
