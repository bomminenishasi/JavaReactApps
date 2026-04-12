package com.shopease.graphql.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Value("${services.user}")
    private String userServiceUrl;

    @Value("${services.product}")
    private String productServiceUrl;

    @Value("${services.order}")
    private String orderServiceUrl;

    @Value("${services.cart}")
    private String cartServiceUrl;

    @Bean
    public WebClient userWebClient() {
        return WebClient.builder().baseUrl(userServiceUrl).build();
    }

    @Bean
    public WebClient productWebClient() {
        return WebClient.builder().baseUrl(productServiceUrl).build();
    }

    @Bean
    public WebClient orderWebClient() {
        return WebClient.builder().baseUrl(orderServiceUrl).build();
    }

    @Bean
    public WebClient cartWebClient() {
        return WebClient.builder().baseUrl(cartServiceUrl).build();
    }
}
