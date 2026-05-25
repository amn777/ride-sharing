package com.ridesharing.apigateway.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

@Component
public class JwtUtil {
    @Value("${jwt.secret}") private String secret;

    private SecretKey key() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }
    public Claims extractClaims(String token) {
        return Jwts.parser().verifyWith(key()).build().parseSignedClaims(token).getPayload();
    }
    public String extractUserId(String token) { return extractClaims(token).getSubject(); }
    public String extractRole(String token)   { return (String) extractClaims(token).get("role"); }
    public boolean isValid(String token) {
        try { extractClaims(token); return true; } catch (Exception e) { return false; }
    }
}
