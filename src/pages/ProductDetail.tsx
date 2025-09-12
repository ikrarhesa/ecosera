
import React, { useState } from 'react';
import { ShoppingCart, Minus, Plus, Heart } from 'lucide-react';

export default function ProductDetail() {
    const [quantity, setQuantity] = useState(2);
    const product = {
        title: 'Regeneratively Grown Organic Coconut Milk, Regular',
        price: 2.79,
        discount: 0.41,
        originalPrice: 4.69,
        imageUrls: [
            'https://via.placeholder.com/350x350',
            'https://via.placeholder.com/350x350',
            'https://via.placeholder.com/350x350'
        ],
        description: '13.5 oz can | $0.21/oz | Compare at $4.69',
        rating: 4.8
    };

    const handleIncrease = () => setQuantity(quantity + 1);
    const handleDecrease = () => setQuantity(quantity > 1 ? quantity - 1 : 1);

    return (
        <div className="container">
            <div className="product-image-container">
                {product.imageUrls.map((url, index) => (
                    <img key={index} src={url} alt={`Product Image ${index + 1}`} />
                ))}
            </div>
            <div className="product-title">{product.title}</div>
            <div className="product-rating">
                <span>{product.rating} ⭐</span>
            </div>
            <div className="product-price">
                ${product.price.toFixed(2)} <span style={{ color: '#ff5a5f' }}>-{(product.discount * 100).toFixed(0)}%</span>
            </div>
            <div className="product-description">{product.description}</div>
            <div className="quantity-container">
                <button className="quantity-button" onClick={handleDecrease}>-</button>
                <div className="quantity-display">{quantity}</div>
                <button className="quantity-button" onClick={handleIncrease}>+</button>
            </div>
            <div className="add-to-cart-container">
                <button className="add-to-cart">Add to Cart</button>
            </div>
        </div>
    );
}
