package com.ecommerce.service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.ecommerce.model.Product;
import com.ecommerce.repository.ProductRepository;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
    }

    public List<String> getAllCategories() {
        return productRepository.findAllCategories();
    }

    public Page<Product> getProductsWithFilters(String category, BigDecimal minPrice, BigDecimal maxPrice,
                                                String search, String sortBy, int page, int size) {
        /* Sort sort = Sort.by("name");

        if ("price-low".equals(sortBy)) {
            sort = Sort.by("price").ascending();
        } else if ("price-high".equals(sortBy)) {
            sort = Sort.by("price").descending();
        } else if ("rating".equals(sortBy)) {
            sort = Sort.by("rating").descending();
        } */
       Sort sort = switch (sortBy) {
        case "price-low" -> Sort.by("price").ascending();
        case "price-high" -> Sort.by("price").descending();
        case "rating" -> Sort.by("rating").descending();
        default -> Sort.by("name");
    };

        Pageable pageable = PageRequest.of(page, size, sort);

        return productRepository.findProductsWithFilters(
                category != null && !category.isEmpty() ? category : null,
                minPrice,
                maxPrice,
                search != null && !search.isEmpty() ? search : null,
                pageable
        );
    }

    public Product saveProduct(Product product) {
        return productRepository.save(product);
    }
}