# GoShopping - E-Commerce System

A modern, full-stack e-commerce application built with Java Spring Boot backend and vanilla HTML/CSS/JavaScript frontend.

![Home Page](<img width="1278" height="762" alt="Home Page-GoShopping" src="https://github.com/user-attachments/assets/d8d240be-55d3-487c-a1d1-9ae4b5a621ed" />
)


## Features

### Backend (Spring Boot + MySQL)
- **User Authentication**: JWT-based authentication with registration and login
- **Product Management**: CRUD operations for products with categories and filtering
- **Shopping Cart**: Add, update, remove items with quantity management
- **Wishlist**: Save favorite products for later
- **Order Processing**: Complete order management system
- **Database**: MySQL with JPA/Hibernate for data persistence
- **Security**: Spring Security with password encryption
- **RESTful APIs**: Clean REST endpoints for all operations

### Frontend (HTML/CSS/JavaScript)
- **Responsive Design**: Mobile-first approach with elegant blue aesthetic
- **User Authentication**: Smart email-first login/registration flow
- **Product Catalog**: Grid layout with search, filtering, and sorting
- **Shopping Cart**: Slide-out sidebar with quantity controls
- **Wishlist**: Heart icon toggle with dedicated sidebar
- **Modern UI**: Smooth animations, hover effects, and micro-interactions
- **Category Navigation**: Visual category cards with icons

## Technology Stack

### Backend
- Java 17
- Spring Boot 3.2.0
- Spring Security
- Spring Data JPA
- MySQL 8.0
- JWT Authentication
- Maven

### Frontend
- HTML5
- CSS3 (Flexbox/Grid)
- Vanilla JavaScript (ES6+)
- Font Awesome Icons
- Responsive Design

## Getting Started

### Prerequisites
- Java 17 or higher
- MySQL 8.0
- Maven 3.6+

### Database Setup
1. Create a MySQL database named `luxe_store`
2. Update database credentials in `src/main/resources/application.properties`

### Running the Application
1. Clone the repository
2. Navigate to the project directory
3. Run the application:
   ```bash
   mvn spring-boot:run
   ```
4. Access the application at `http://localhost:8080/api/`

### Default Configuration
- Server runs on port 8080
- API endpoints are prefixed with `/api`
- Static files served from `/src/main/resources/static`
- Database auto-creates tables on first run

## API Endpoints

### Authentication
- `POST /api/auth/check-email` - Check if email exists
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Products
- `GET /api/products` - Get products with filtering/pagination
- `GET /api/products/{id}` - Get product by ID
- `GET /api/products/categories` - Get all categories

### Cart (Authenticated)
- `GET /api/cart` - Get user's cart items
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/{id}` - Update cart item quantity
- `DELETE /api/cart/{id}` - Remove item from cart

### Wishlist (Authenticated)
- `GET /api/wishlist` - Get user's wishlist
- `POST /api/wishlist/{productId}` - Add to wishlist
- `DELETE /api/wishlist/{productId}` - Remove from wishlist

## Project Structure

```
src/
├── main/
│   ├── java/com/ecommerce/
│   │   ├── config/          # Configuration classes
│   │   ├── controller/      # REST controllers
│   │   ├── dto/            # Data transfer objects
│   │   ├── model/          # JPA entities
│   │   ├── repository/     # Data repositories
│   │   ├── security/       # Security configuration
│   │   └── service/        # Business logic
│   └── resources/
│       ├── static/         # Frontend files
│       │   ├── css/        # Stylesheets
│       │   ├── js/         # JavaScript files
│       │   └── index.html  # Main HTML file
│       └── application.properties
```

## Key Features Implementation

### Smart Authentication Flow
- Email-first approach checks if user exists
- Dynamic form switching between login/register
- JWT token storage and automatic authentication
- Secure password handling with BCrypt

### Product Management
- Category-based organization
- Advanced filtering (price, category, search)
- Sorting options (name, price, rating)
- Stock management with low stock indicators

### Shopping Experience
- One-click add to cart/wishlist
- Real-time quantity updates
- Persistent cart across sessions
- Smooth UI transitions and feedback

### Responsive Design
- Mobile-first CSS approach
- Flexible grid layouts
- Touch-friendly interactions
- Optimized for all screen sizes

## Security Features
- JWT-based authentication
- Password encryption with BCrypt
- CORS configuration for frontend
- Protected API endpoints
- Input validation and sanitization

## Database Schema
- Users table with authentication data
- Products with categories and inventory
- Cart items linked to users and products
- Wishlist items for saved products
- Orders and order items for purchase history

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License
This project is licensed under the MIT License.
