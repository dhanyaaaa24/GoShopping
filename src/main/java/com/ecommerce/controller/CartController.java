package com.ecommerce.controller;

import com.ecommerce.dto.CartItemRequest;
import com.ecommerce.model.CartItem;
import com.ecommerce.model.User;
import com.ecommerce.service.CartService;
import com.ecommerce.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/cart")
@CrossOrigin(origins = "*", maxAge = 3600)
public class CartController {

    @Autowired
    private CartService cartService;

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<CartItem>> getCartItems(Authentication authentication) {
        User user = userService.findByEmail(authentication.getName());
        List<CartItem> cartItems = cartService.getCartItems(user);
        return ResponseEntity.ok(cartItems);
    }

    @PostMapping
    public ResponseEntity<CartItem> addToCart(@Valid @RequestBody CartItemRequest request,
                                              Authentication authentication) {
        User user = userService.findByEmail(authentication.getName());
        CartItem cartItem = cartService.addToCart(user, request);
        return ResponseEntity.ok(cartItem);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCartItem(@PathVariable Long id,
                                            @RequestParam Integer quantity,
                                            Authentication authentication) {
        User user = userService.findByEmail(authentication.getName());
        CartItem cartItem = cartService.updateCartItem(user, id, quantity);
        return ResponseEntity.ok(cartItem);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> removeFromCart(@PathVariable Long id, Authentication authentication) {
        User user = userService.findByEmail(authentication.getName());
        cartService.removeFromCart(user, id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping
    public ResponseEntity<?> clearCart(Authentication authentication) {
        User user = userService.findByEmail(authentication.getName());
        cartService.clearCart(user);
        return ResponseEntity.ok().build();
    }
}