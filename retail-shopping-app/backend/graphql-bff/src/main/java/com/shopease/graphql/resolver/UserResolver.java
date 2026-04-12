package com.shopease.graphql.resolver;

import com.shopease.graphql.model.AuthResponse;
import com.shopease.graphql.model.LogoutResult;
import com.shopease.graphql.model.RegisterInput;
import com.shopease.graphql.model.User;
import com.shopease.graphql.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;
import reactor.core.publisher.Mono;

@Slf4j
@Controller
@RequiredArgsConstructor
public class UserResolver {

    private final UserService userService;

    @QueryMapping
    public Mono<User> me() {
        return Mono.empty();
    }

    @MutationMapping
    public Mono<AuthResponse> login(@Argument String email, @Argument String password) {
        return userService.login(email, password);
    }

    @MutationMapping
    public Mono<AuthResponse> register(@Argument RegisterInput input) {
        return userService.register(input);
    }

    @MutationMapping
    public Mono<AuthResponse> refreshToken(@Argument String refreshToken) {
        return userService.refreshToken(refreshToken);
    }

    @MutationMapping
    public Mono<LogoutResult> logout() {
        return Mono.just(new LogoutResult(true));
    }
}
