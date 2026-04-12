package com.shopease.graphql.resolver;

import com.shopease.graphql.model.Category;
import com.shopease.graphql.model.Product;
import com.shopease.graphql.model.ProductFilter;
import com.shopease.graphql.model.ProductPage;
import com.shopease.graphql.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;
import reactor.core.publisher.Mono;

import java.util.List;

@Slf4j
@Controller
@RequiredArgsConstructor
public class ProductResolver {

    private final ProductService productService;

    @QueryMapping
    public Mono<ProductPage> products(@Argument ProductFilter filter) {
        return productService.getProducts(filter);
    }

    @QueryMapping
    public Mono<Product> product(@Argument String id) {
        return productService.getProductById(id);
    }

    @QueryMapping
    public Mono<ProductPage> searchProducts(@Argument String query, @Argument Integer page, @Argument Integer size) {
        return productService.searchProducts(query, page != null ? page : 0, size != null ? size : 12);
    }

    @QueryMapping
    public Mono<List<Category>> categories() {
        return productService.getCategories();
    }
}
