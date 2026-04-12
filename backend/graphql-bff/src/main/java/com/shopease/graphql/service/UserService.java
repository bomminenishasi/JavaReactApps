package com.shopease.graphql.service;

import com.shopease.graphql.model.AuthResponse;
import com.shopease.graphql.model.LogoutResult;
import com.shopease.graphql.model.RegisterInput;
import com.shopease.graphql.model.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final WebClient userWebClient;

    public Mono<User> getMe(String userId) {
        return userWebClient.get().uri("/api/users/" + userId)
            .retrieve()
            .bodyToMono(User.class)
            .onErrorResume(e -> {
                log.error("Error fetching user {}: {}", userId, e.getMessage());
                return Mono.empty();
            });
    }

    public Mono<AuthResponse> login(String email, String password) {
        return userWebClient.post().uri("/api/auth/login")
            .bodyValue(Map.of("email", email, "password", password))
            .retrieve()
            .bodyToMono(AuthResponse.class)
            .onErrorResume(e -> {
                log.error("Error logging in: {}", e.getMessage());
                return Mono.error(new RuntimeException("Login failed: " + e.getMessage()));
            });
    }

    public Mono<AuthResponse> register(RegisterInput input) {
        return userWebClient.post().uri("/api/auth/register")
            .bodyValue(input)
            .retrieve()
            .bodyToMono(AuthResponse.class)
            .onErrorResume(e -> {
                log.error("Error registering: {}", e.getMessage());
                return Mono.error(new RuntimeException("Registration failed: " + e.getMessage()));
            });
    }

    public Mono<AuthResponse> refreshToken(String refreshToken) {
        return userWebClient.post().uri("/api/auth/refresh")
            .bodyValue(Map.of("refreshToken", refreshToken))
            .retrieve()
            .bodyToMono(AuthResponse.class)
            .onErrorResume(e -> {
                log.error("Error refreshing token: {}", e.getMessage());
                return Mono.empty();
            });
    }

    public Mono<LogoutResult> logout(String userId) {
        return userWebClient.post().uri("/api/auth/logout")
            .bodyValue(Map.of("userId", userId != null ? userId : ""))
            .retrieve()
            .bodyToMono(Void.class)
            .thenReturn(new LogoutResult(true))
            .onErrorReturn(new LogoutResult(true));
    }
}
