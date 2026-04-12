package com.banking.auth;

import com.banking.auth.dto.*;
import com.banking.auth.entity.RefreshToken;
import com.banking.auth.service.AuthService;
import com.banking.auth.service.RefreshTokenService;
import com.banking.auth.service.TokenService;
import com.banking.common.exception.BusinessException;
import com.banking.users.entity.User;
import com.banking.users.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService Unit Tests")
class AuthServiceTest {

    @Mock UserRepository        userRepository;
    @Mock PasswordEncoder       passwordEncoder;
    @Mock TokenService          tokenService;
    @Mock RefreshTokenService   refreshTokenService;
    @Mock AuthenticationManager authenticationManager;

    @InjectMocks AuthService authService;

    private User testUser;
    private RefreshToken testRefreshToken;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .email("john@example.com")
                .passwordHash("encoded-password")
                .firstName("John")
                .lastName("Doe")
                .role("CUSTOMER")
                .build();

        testRefreshToken = RefreshToken.builder()
                .token("refresh-token-uuid")
                .user(testUser)
                .expiresAt(LocalDateTime.now().plusSeconds(604800))
                .revoked(false)
                .build();
    }

    // ── register ──────────────────────────────────────────────────────────────

    @Test
    @DisplayName("register: success returns AuthResponse with tokens")
    void register_success() {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("john@example.com");
        req.setPassword("Password1!");
        req.setFirstName("John");
        req.setLastName("Doe");

        when(userRepository.existsByEmail("john@example.com")).thenReturn(false);
        when(passwordEncoder.encode("Password1!")).thenReturn("encoded-password");
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(tokenService.generateAccessToken(any())).thenReturn("access-token");
        when(refreshTokenService.createRefreshToken(any())).thenReturn(testRefreshToken);

        AuthResponse response = authService.register(req);

        assertThat(response.getAccessToken()).isEqualTo("access-token");
        assertThat(response.getRefreshToken()).isEqualTo("refresh-token-uuid");
        assertThat(response.getEmail()).isEqualTo("john@example.com");
        assertThat(response.getRole()).isEqualTo("CUSTOMER");
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("register: duplicate email throws BusinessException")
    void register_duplicateEmail_throwsException() {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("john@example.com");
        req.setPassword("Password1!");
        req.setFirstName("John");
        req.setLastName("Doe");

        when(userRepository.existsByEmail("john@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(req))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("already registered");
        verify(userRepository, never()).save(any());
    }

    // ── login ─────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("login: valid credentials returns AuthResponse")
    void login_validCredentials_returnsAuthResponse() {
        LoginRequest req = new LoginRequest();
        req.setEmail("john@example.com");
        req.setPassword("Password1!");

        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(testUser));
        when(tokenService.generateAccessToken(testUser)).thenReturn("access-token");
        when(refreshTokenService.createRefreshToken(testUser)).thenReturn(testRefreshToken);

        AuthResponse response = authService.login(req);

        assertThat(response.getAccessToken()).isEqualTo("access-token");
        assertThat(response.getEmail()).isEqualTo("john@example.com");
        verify(refreshTokenService).revokeAllUserTokens(testUser);
    }

    @Test
    @DisplayName("login: bad credentials throws exception")
    void login_badCredentials_throwsException() {
        LoginRequest req = new LoginRequest();
        req.setEmail("john@example.com");
        req.setPassword("wrong");

        doThrow(new BadCredentialsException("Bad credentials"))
                .when(authenticationManager)
                .authenticate(any(UsernamePasswordAuthenticationToken.class));

        assertThatThrownBy(() -> authService.login(req))
                .isInstanceOf(BadCredentialsException.class);
    }

    // ── refreshToken ──────────────────────────────────────────────────────────

    @Test
    @DisplayName("refreshToken: valid token returns new AuthResponse")
    void refreshToken_validToken_returnsNewAuthResponse() {
        RefreshTokenRequest req = new RefreshTokenRequest();
        req.setRefreshToken("refresh-token-uuid");

        when(refreshTokenService.verifyRefreshToken("refresh-token-uuid")).thenReturn(testRefreshToken);
        when(tokenService.generateAccessToken(testUser)).thenReturn("new-access-token");
        when(refreshTokenService.createRefreshToken(testUser)).thenReturn(testRefreshToken);

        AuthResponse response = authService.refreshToken(req);

        assertThat(response.getAccessToken()).isEqualTo("new-access-token");
        verify(refreshTokenService).revokeToken("refresh-token-uuid");
    }

    // ── logout ────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("logout: revokes the refresh token")
    void logout_revokesToken() {
        RefreshTokenRequest req = new RefreshTokenRequest();
        req.setRefreshToken("refresh-token-uuid");

        authService.logout(req);

        verify(refreshTokenService).revokeToken("refresh-token-uuid");
    }

    // ── forgotPassword ────────────────────────────────────────────────────────

    @Test
    @DisplayName("forgotPassword: unknown email throws BusinessException")
    void forgotPassword_unknownEmail_throwsException() {
        ForgotPasswordRequest req = new ForgotPasswordRequest();
        req.setEmail("unknown@example.com");

        when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.forgotPassword(req))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("No account found");
    }

    @Test
    @DisplayName("forgotPassword: known email completes without error")
    void forgotPassword_knownEmail_succeeds() {
        ForgotPasswordRequest req = new ForgotPasswordRequest();
        req.setEmail("john@example.com");

        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(testUser));

        assertThatNoException().isThrownBy(() -> authService.forgotPassword(req));
    }
}
