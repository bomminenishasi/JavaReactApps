package com.shopease.product.service;

import com.shopease.product.dto.CategoryDto;
import com.shopease.product.dto.ProductDto;
import com.shopease.product.dto.ProductPageDto;
import com.shopease.product.entity.Category;
import com.shopease.product.entity.Product;
import com.shopease.product.repository.CategoryRepository;
import com.shopease.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public ProductPageDto getProducts(int page, int size, String categoryId, String brand, String search, String sortBy) {
        Pageable pageable = buildPageable(page, size, sortBy);
        Page<Product> result;

        if (search != null && !search.isBlank()) {
            result = productRepository.search(search, pageable);
        } else if (categoryId != null) {
            try {
                result = productRepository.findByCategoryId(Long.parseLong(categoryId), pageable);
            } catch (NumberFormatException e) {
                // categoryId is a name string (e.g. "Clothing")
                result = productRepository.findByCategoryNameIgnoreCase(categoryId, pageable);
            }
        } else if (brand != null) {
            result = productRepository.findByBrandIgnoreCase(brand, pageable);
        } else {
            result = productRepository.findAll(pageable);
        }

        return ProductPageDto.builder()
            .content(result.getContent().stream().map(this::toDto).collect(Collectors.toList()))
            .totalElements((int) result.getTotalElements())
            .totalPages(result.getTotalPages())
            .currentPage(page)
            .pageSize(size)
            .build();
    }

    public ProductDto getProduct(Long id) {
        return productRepository.findById(id)
            .map(this::toDto)
            .orElseThrow(() -> new IllegalArgumentException("Product not found: " + id));
    }

    public List<CategoryDto> getCategories() {
        return categoryRepository.findAll().stream()
            .map(this::toCategoryDto)
            .collect(Collectors.toList());
    }

    private Pageable buildPageable(int page, int size, String sortBy) {
        Sort sort = switch (sortBy != null ? sortBy : "") {
            case "PRICE_ASC" -> Sort.by("price").ascending();
            case "PRICE_DESC" -> Sort.by("price").descending();
            case "RATING" -> Sort.by("rating").descending();
            case "NEWEST" -> Sort.by("createdAt").descending();
            default -> Sort.by("id").ascending();
        };
        return PageRequest.of(page, size, sort);
    }

    private ProductDto toDto(Product p) {
        List<String> images = p.getImages() != null
            ? Arrays.asList(p.getImages().split("\\|"))
            : Collections.emptyList();
        List<String> tags = p.getTags() != null
            ? Arrays.asList(p.getTags().split(","))
            : Collections.emptyList();

        return ProductDto.builder()
            .id(p.getId()).sku(p.getSku()).name(p.getName())
            .description(p.getDescription()).price(p.getPrice())
            .originalPrice(p.getOriginalPrice())
            .category(toCategoryDto(p.getCategory()))
            .brand(p.getBrand()).images(images)
            .rating(p.getRating()).reviewCount(p.getReviewCount())
            .inStock(p.getInStock()).stockQuantity(p.getStockQuantity())
            .tags(tags).createdAt(p.getCreatedAt())
            .build();
    }

    private CategoryDto toCategoryDto(Category c) {
        return CategoryDto.builder()
            .id(c.getId()).name(c.getName()).slug(c.getSlug())
            .parentId(c.getParentId()).imageUrl(c.getImageUrl())
            .build();
    }
}
