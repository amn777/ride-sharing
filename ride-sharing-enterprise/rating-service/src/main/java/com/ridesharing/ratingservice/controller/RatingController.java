package com.ridesharing.ratingservice.controller;

import com.ridesharing.common.response.ApiResponse;
import com.ridesharing.ratingservice.model.Rating;
import com.ridesharing.ratingservice.repository.RatingRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/ratings")
@RequiredArgsConstructor
public class RatingController {

    private final RatingRepository ratingRepository;

    @PostMapping
    public ResponseEntity<ApiResponse<Rating>> submitRating(
            @RequestHeader("X-User-Id") String raterId,
            @Valid @RequestBody Rating rating) {
        rating.setRaterId(raterId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Rating submitted", ratingRepository.save(rating)));
    }

    @GetMapping("/{rateeId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getRatings(@PathVariable String rateeId) {
        List<Rating> ratings = ratingRepository.findByRateeId(rateeId);
        double avg = ratings.stream().mapToInt(Rating::getStars).average().orElse(0);
        return ResponseEntity.ok(ApiResponse.success(Map.of(
            "rateeId", rateeId, "averageRating", avg,
            "totalRatings", ratings.size(), "ratings", ratings)));
    }
}
