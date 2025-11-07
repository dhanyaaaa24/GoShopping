package com.ecommerce.controller;

import com.ecommerce.model.User;
import com.ecommerce.model.WishlistItem;
import com.ecommerce.service.UserService;
import com.ecommerce.service.WishlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/wishlist")
@CrossOrigin(origins = "*", maxAge = 3600)
public class WishlistController {

    @Autowired
    private WishlistService wishlistService;

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<WishlistItem>> getWishlistItems(Authentication authentication) {
        User user = userService.findByEmail(authentication.getName());
        List<WishlistItem> wishlistItems = wishlistService.getWishlistItems(user);
        return ResponseEntity.ok(wishlistItems);
    }

    @GetMapping("/check/{productId}")
    public ResponseEntity<Map<String, Boolean>> checkWishlist(@PathVariable Long productId,
                                                              Authentication authentication) {
        User user = userService.findByEmail(authentication.getName());
        boolean inWishlist = wishlistService.isInWishlist(user, productId);

        Map<String, Boolean> response = new HashMap<>();
        response.put("inWishlist", inWishlist);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{productId}")
    public ResponseEntity<WishlistItem> addToWishlist(@PathVariable Long productId,
                                                      Authentication authentication) {
        User user = userService.findByEmail(authentication.getName());
        WishlistItem wishlistItem = wishlistService.addToWishlist(user, productId);
        return ResponseEntity.ok(wishlistItem);
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<?> removeFromWishlist(@PathVariable Long productId,
                                                Authentication authentication) {
        User user = userService.findByEmail(authentication.getName());
        wishlistService.removeFromWishlist(user, productId);
        return ResponseEntity.ok().build();
    }
}