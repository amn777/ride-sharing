package com.ridesharing.userservice.dto;

import com.ridesharing.userservice.model.User;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank @Size(min=2, max=100) private String name;
    @NotBlank @Email                private String email;
    @NotBlank @Pattern(regexp="^[6-9]\\d{9}$", message="Invalid mobile number")
                                    private String phone;
    @NotBlank @Size(min=8)          private String password;
    private User.Role role = User.Role.RIDER;
}
