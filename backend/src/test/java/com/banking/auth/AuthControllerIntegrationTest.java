package com.banking.auth;

import com.banking.auth.dto.LoginRequest;
import com.banking.auth.dto.RegisterRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.kafka.test.context.EmbeddedKafka;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
@EmbeddedKafka(partitions = 1, topics = {"txn-initiated"})
@DisplayName("AuthController Integration Tests")
class AuthControllerIntegrationTest {

    @Autowired MockMvc       mockMvc;
    @Autowired ObjectMapper  objectMapper;

    // ── /api/auth/register ────────────────────────────────────────────────────

    @Test
    @DisplayName("POST /api/auth/register: valid payload returns 201 with tokens")
    void register_validPayload_returns201() throws Exception {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("newuser@example.com");
        req.setPassword("Password1!");
        req.setFirstName("New");
        req.setLastName("User");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.accessToken", notNullValue()))
                .andExpect(jsonPath("$.data.refreshToken", notNullValue()))
                .andExpect(jsonPath("$.data.email", is("newuser@example.com")))
                .andExpect(jsonPath("$.data.role", is("CUSTOMER")));
    }

    @Test
    @DisplayName("POST /api/auth/register: duplicate email returns 400")
    void register_duplicateEmail_returns400() throws Exception {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("dup@example.com");
        req.setPassword("Password1!");
        req.setFirstName("Dup");
        req.setLastName("User");

        // First registration
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated());

        // Second registration with same email
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)));
    }

    @Test
    @DisplayName("POST /api/auth/register: missing required fields returns 400")
    void register_missingFields_returns400() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isBadRequest());
    }

    // ── /api/auth/login ───────────────────────────────────────────────────────

    @Test
    @DisplayName("POST /api/auth/login: valid credentials returns 200 with tokens")
    void login_validCredentials_returns200() throws Exception {
        // Register first
        RegisterRequest reg = new RegisterRequest();
        reg.setEmail("logintest@example.com");
        reg.setPassword("Password1!");
        reg.setFirstName("Login");
        reg.setLastName("Test");
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(reg)));

        // Now login
        LoginRequest login = new LoginRequest();
        login.setEmail("logintest@example.com");
        login.setPassword("Password1!");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.accessToken", notNullValue()))
                .andExpect(jsonPath("$.data.tokenType", is("Bearer")));
    }

    @Test
    @DisplayName("POST /api/auth/login: wrong password returns 401")
    void login_wrongPassword_returns401() throws Exception {
        RegisterRequest reg = new RegisterRequest();
        reg.setEmail("wrongpass@example.com");
        reg.setPassword("Password1!");
        reg.setFirstName("Wrong");
        reg.setLastName("Pass");
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(reg)));

        LoginRequest login = new LoginRequest();
        login.setEmail("wrongpass@example.com");
        login.setPassword("BadPassword!");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("POST /api/auth/login: unknown email returns 401")
    void login_unknownEmail_returns401() throws Exception {
        LoginRequest login = new LoginRequest();
        login.setEmail("ghost@example.com");
        login.setPassword("Password1!");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isUnauthorized());
    }

    // ── /api/auth/refresh ─────────────────────────────────────────────────────

    @Test
    @DisplayName("POST /api/auth/refresh: valid refresh token returns new access token")
    void refresh_validToken_returnsNewAccessToken() throws Exception {
        // Register and login to get refresh token
        RegisterRequest reg = new RegisterRequest();
        reg.setEmail("refresh@example.com");
        reg.setPassword("Password1!");
        reg.setFirstName("Refresh");
        reg.setLastName("User");

        MvcResult regResult = mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(reg)))
                .andReturn();

        String body = regResult.getResponse().getContentAsString();
        String refreshToken = objectMapper.readTree(body).path("data").path("refreshToken").asText();

        mockMvc.perform(post("/api/auth/refresh")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"refreshToken\":\"" + refreshToken + "\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.accessToken", notNullValue()));
    }

    @Test
    @DisplayName("POST /api/auth/refresh: invalid token returns 400")
    void refresh_invalidToken_returns400() throws Exception {
        mockMvc.perform(post("/api/auth/refresh")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"refreshToken\":\"invalid-token-uuid\"}"))
                .andExpect(status().isBadRequest());
    }

    // ── /api/auth/logout ──────────────────────────────────────────────────────

    @Test
    @DisplayName("POST /api/auth/logout: valid token logs out successfully")
    void logout_validToken_returns200() throws Exception {
        RegisterRequest reg = new RegisterRequest();
        reg.setEmail("logout@example.com");
        reg.setPassword("Password1!");
        reg.setFirstName("Logout");
        reg.setLastName("User");

        MvcResult regResult = mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(reg)))
                .andReturn();

        String refreshToken = objectMapper.readTree(regResult.getResponse().getContentAsString())
                .path("data").path("refreshToken").asText();

        mockMvc.perform(post("/api/auth/logout")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"refreshToken\":\"" + refreshToken + "\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));
    }
}
