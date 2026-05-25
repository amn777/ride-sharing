package com.ridesharing.apigateway.filter;

import com.ridesharing.apigateway.util.JwtUtil;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends AbstractGatewayFilterFactory<JwtAuthFilter.Config> {
    private final JwtUtil jwtUtil;
    public JwtAuthFilter() { super(Config.class); this.jwtUtil = null; }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            String path = exchange.getRequest().getURI().getPath();
            if (config.getPublicPaths() != null &&
                config.getPublicPaths().stream().anyMatch(path::startsWith)) {
                return chain.filter(exchange);
            }
            String auth = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
            if (auth == null || !auth.startsWith("Bearer ")) return reject(exchange);
            try {
                String token = auth.substring(7);
                String userId = jwtUtil.extractUserId(token);
                String role   = jwtUtil.extractRole(token);
                ServerWebExchange mutated = exchange.mutate()
                    .request(r -> r.headers(h -> {
                        h.set("X-User-Id", userId);
                        h.set("X-User-Role", role);
                    })).build();
                return chain.filter(mutated);
            } catch (Exception e) {
                log.warn("JWT invalid: {}", e.getMessage());
                return reject(exchange);
            }
        };
    }
    private Mono<Void> reject(ServerWebExchange ex) {
        ex.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
        return ex.getResponse().setComplete();
    }
    @Data public static class Config { private List<String> publicPaths; }
}
