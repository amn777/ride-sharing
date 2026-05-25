package com.ridesharing.userservice.dto;

import com.ridesharing.userservice.model.User;
import lombok.Builder;
import lombok.Data;
import java.util.UUID;

@Data @Builder
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    @Builder.Default private String tokenType = "Bearer";
    private long expiresIn;
    private UserInfo user;

    @Data @Builder
    public static class UserInfo {
        private UUID id;
        private String name;
        private String email;
        private String phone;
        private User.Role role;
    }
}
