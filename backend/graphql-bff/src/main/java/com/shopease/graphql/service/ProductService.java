package com.shopease.graphql.service;

import com.shopease.graphql.model.Category;
import com.shopease.graphql.model.Product;
import com.shopease.graphql.model.ProductFilter;
import com.shopease.graphql.model.ProductPage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductService {

    private final WebClient productWebClient;

    public Mono<ProductPage> getProducts(ProductFilter filter) {
        int page = filter != null && filter.getPage() != null ? filter.getPage() : 0;
        int size = filter != null && filter.getSize() != null ? filter.getSize() : 12;

        return productWebClient.get().uri(uriBuilder -> {
            uriBuilder.path("/api/products")
                .queryParam("page", page)
                .queryParam("size", size);
            if (filter != null && filter.getCategoryId() != null)
                uriBuilder.queryParam("categoryId", filter.getCategoryId());
            if (filter != null && filter.getSearch() != null)
                uriBuilder.queryParam("search", filter.getSearch());
            if (filter != null && filter.getBrand() != null)
                uriBuilder.queryParam("brand", filter.getBrand());
            if (filter != null && filter.getSortBy() != null)
                uriBuilder.queryParam("sortBy", filter.getSortBy());
            if (filter != null && filter.getMinPrice() != null)
                uriBuilder.queryParam("minPrice", filter.getMinPrice());
            if (filter != null && filter.getMaxPrice() != null)
                uriBuilder.queryParam("maxPrice", filter.getMaxPrice());
            return uriBuilder.build();
        })
        .retrieve()
        .bodyToMono(ProductPage.class)
        .onErrorResume(e -> {
            log.error("Error fetching products: {}", e.getMessage());
            return Mono.empty();
        });
    }

    public Mono<Product> getProductById(String id) {
        return productWebClient.get().uri("/api/products/" + id)
            .retrieve()
            .bodyToMono(Product.class)
            .onErrorResume(e -> {
                log.error("Error fetching product {}: {}", id, e.getMessage());
                return Mono.empty();
            });
    }

    public Mono<ProductPage> searchProducts(String query, int page, int size) {
        return productWebClient.get().uri(uriBuilder -> uriBuilder
                .path("/api/products/search")
                .queryParam("query", query)
                .queryParam("page", page)
                .queryParam("size", size)
                .build())
            .retrieve()
            .bodyToMono(ProductPage.class)
            .onErrorResume(e -> {
                log.error("Error searching products: {}", e.getMessage());
                return Mono.empty();
            });
    }

    public Mono<List<Category>> getCategories() {
        return productWebClient.get().uri("/api/categories")
            .retrieve()
            .bodyToFlux(Category.class)
            .collectList()
            .onErrorResume(e -> {
                log.error("Error fetching categories: {}", e.getMessage());
                return Mono.just(List.of());
            });
    }
}
