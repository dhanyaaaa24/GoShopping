package com.ecommerce.config;

import com.ecommerce.model.Product;
import com.ecommerce.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private ProductRepository productRepository;

    @Override
    public void run(String... args) throws Exception {
        if (productRepository.count() == 0) {
            initializeProducts();
        }
    }

    private void initializeProducts() {
        Product[] products = {
                new Product("Premium Wireless Headphones", new BigDecimal("299.99"),
                        "High-quality wireless headphones with noise cancellation and premium sound quality.",
                        "https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&fit=crop",
                        "Electronics", 25),

                new Product("Organic Cotton T-Shirt", new BigDecimal("39.99"),
                        "Soft, comfortable organic cotton t-shirt perfect for everyday wear.",
                        "https://images.pexels.com/photos/1488463/pexels-photo-1488463.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&fit=crop",
                        "Clothing", 50),

                new Product("Smart Fitness Watch", new BigDecimal("199.99"),
                        "Track your fitness goals with this advanced smartwatch featuring heart rate monitoring.",
                        "https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&fit=crop",
                        "Electronics", 15),

                new Product("Artisan Coffee Beans", new BigDecimal("24.99"),
                        "Premium single-origin coffee beans roasted to perfection for the ultimate coffee experience.",
                        "https://images.pexels.com/photos/894695/pexels-photo-894695.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&fit=crop",
                        "Food & Beverage", 100),

                new Product("Minimalist Leather Wallet", new BigDecimal("79.99"),
                        "Handcrafted leather wallet with a slim profile and RFID blocking technology.",
                        "https://images.pexels.com/photos/1445597/pexels-photo-1445597.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&fit=crop",
                        "Accessories", 30),

                new Product("Wireless Charging Pad", new BigDecimal("49.99"),
                        "Fast wireless charging pad compatible with all Qi-enabled devices.",
                        "https://images.pexels.com/photos/4963337/pexels-photo-4963337.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&fit=crop",
                        "Electronics", 40)
        };

        for (Product product : products) {
            product.setRating(new BigDecimal("4.5"));
            product.setReviewCount(100);
            productRepository.save(product);
        }
    }
}