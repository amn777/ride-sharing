package com.ridesharing.ratingservice.repository;

import com.ridesharing.ratingservice.model.Rating;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.util.List;

public interface RatingRepository extends MongoRepository<Rating, String> {
    List<Rating> findByRateeId(String rateeId);
    @Query("{'rateeId': ?0}")
    List<Rating> findByRateeIdForAvg(String rateeId);
}
