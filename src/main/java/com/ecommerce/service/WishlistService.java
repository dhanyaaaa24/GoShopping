package com.ecommerce.service;

import com.ecommerce.model.Product;
import com.ecommerce.model.User;
import com.ecommerce.model.WishlistItem;
import com.ecommerce.repository.WishlistItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class WishlistService {

    @Autowired
    private WishlistItemRepository wishlistItemRepository;

    @Autowired
    private ProductService productService;

    public List<WishlistItem> getWishlistItems(User user) {
        return wishlistItemRepository.findByUser(user);
    }

    public boolean isInWishlist(User user, Long productId) {
        Product product = productService.getProductById(productId);
        return wishlistItemRepository.existsByUserAndProduct(user, product);
    }

    @Transactional
    public WishlistItem addToWishlist(User user, Long productId) {
        Product product = productService.getProductById(productId);

        Optional<WishlistItem> existingItem = wishlistItemRepository.findByUserAndProduct(user, product);
        if (existingItem.isPresent()) {
            return existingItem.get();
        }

        WishlistItem wishlistItem = new WishlistItem(user, product);
        return wishlistItemRepository.save(wishlistItem);
    }

    @Transactional
    public void removeFromWishlist(User user, Long productId) {
        Product product = productService.getProductById(productId);
        Optional<WishlistItem> wishlistItem = wishlistItemRepository.findByUserAndProduct(user, product);

        if (wishlistItem.isPresent()) {
            if (!wishlistItem.get().getUser().getId().equals(user.getId())) {
                throw new RuntimeException("Unauthorized access to wishlist item");
            }
            wishlistItemRepository.delete(wishlistItem.get());
        }
    }
}