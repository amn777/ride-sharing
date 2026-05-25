package com.ridesharing.ratingservice.model;

import jakarta.validation.constraints.*;
import lombok.*;
import org.springframework.data.annotation.*;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "ratings")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Rating {
    @Id private String id;
    @NotBlank private String rideId;
    @NotBlank private String raterId;
    @NotBlank private String rateeId;
    private String rateeType;  // DRIVER or RIDER
    @Min(1) @Max(5) private int stars;
    private String comment;
    @CreatedDate private LocalDateTime createdAt;
}
