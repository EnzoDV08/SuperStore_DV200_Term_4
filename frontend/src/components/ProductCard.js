
    // src/components/ProductCard.js

import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FiHeart, FiShuffle, FiSearch, FiShoppingCart } from "react-icons/fi";
import { FaStar, FaRegStar, FaStarHalfAlt } from "react-icons/fa";
import { CartContext } from "../contexts/CartContext";
import { doc, updateDoc, setDoc, getDoc, arrayUnion } from 'firebase/firestore';
import { firestore, auth } from '../firebaseConfig';

const ProductCard = ({ product = {} }) => {
    const navigate = useNavigate();
    const { addToCart } = useContext(CartContext);
    const [hovered, setHovered] = useState(false);
    const [cartHovered, setCartHovered] = useState(false);

    const handleClick = () => {
        navigate(`/product/${product.id || ""}`);
    };

    const handleAddToCart = async (e) => {
        e.stopPropagation();
        const user = auth.currentUser;
        if (!user) {
            navigate('/signin');
            return;
        }

        const cartRef = doc(firestore, "users", user.uid, "carts", user.uid);
        const cartSnapshot = await getDoc(cartRef);

        const cartItem = {
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            addedBy: user.uid,
            sellerId: product.sellerId || "unknown"
        };

        try {
            if (cartSnapshot.exists()) {
                await updateDoc(cartRef, {
                    items: arrayUnion(cartItem)
                });
            } else {
                await setDoc(cartRef, { items: [cartItem] });
            }
            addToCart(cartItem);
        } catch (error) {
            console.error("Error adding to cart:", error);
        }
    };

    const handleAddToWishlist = async (e) => {
        e.stopPropagation();
        const user = auth.currentUser;
        if (!user) {
            navigate('/signin');
            return;
        }

        const wishlistRef = doc(firestore, "users", user.uid, "wishlist", product.id);
        const wishlistItem = {
            id: product.id,
            name: product.name,
            imageUrl: product.imageUrl,
            price: product.price,
            category: product.category || "Uncategorized",
            addedAt: new Date(),
        };

        try {
            await setDoc(wishlistRef, wishlistItem);
            alert("Product added to wishlist!");
        } catch (error) {
            console.error("Error adding to wishlist:", error);
        }
    };

    // Fallback values for properties
    const imageUrl = product?.imageUrl || "https://via.placeholder.com/280x250";
    const name = product?.name || product?.title || "Product Name";
    const rating = product?.rating || 0;
    const price = product?.price ? product.price.toFixed(2) : "N/A";
    const discountPercentage = product?.discountPercentage || 0;
    const discountedPrice = discountPercentage > 0 ? (price - (price * discountPercentage) / 100).toFixed(2) : price;

    const renderStars = (rating = 0) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                stars.push(<FaStar key={i} style={{ color: "#ffb400", marginRight: "2px" }} />);
            } else if (i - rating < 1) {
                stars.push(<FaStarHalfAlt key={i} style={{ color: "#ffb400", marginRight: "2px" }} />);
            } else {
                stars.push(<FaRegStar key={i} style={{ color: "#ffb400", marginRight: "2px" }} />);
            }
        }
        return stars;
    };

    const styles = {
        card: {
            position: "relative",
            maxWidth: "280px",
            height: "420px",
            borderRadius: "35px 0 35px 0",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            cursor: "pointer",
            transition: "transform 0.4s ease, box-shadow 0.4s ease",
            overflow: "visible",
            backgroundColor: "#fff",
            display: "flex",
            flexDirection: "column",
            transform: hovered ? "scale(1.05)" : "scale(1)",
            marginBottom: "20px",
        },
        imageContainer: {
            position: "relative",
            overflow: "hidden",
            borderTopLeftRadius: "35px",
        },
        image: {
            width: "100%",
            height: "250px",
            objectFit: "cover",
            transition: "transform 0.4s ease",
            transform: hovered ? "scale(1.1)" : "scale(1)",
        },
        discountLabel: {
            position: "absolute",
            top: "10px",
            left: "10px",
            backgroundColor: "#ff4c4c",
            color: "#fff",
            padding: "8px 14px",
            fontWeight: "bold",
            fontSize: "14px",
            borderRadius: "8px 0 0 8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1,
            clipPath: "polygon(0 0, 100% 0, 85% 100%, 0% 100%)",
        },
        discountText: {
            fontSize: "16px",
            fontWeight: "bold",
            marginRight: "4px",
        },
        percentSymbol: {
            fontSize: "12px",
        },
        iconContainer: {
            position: "absolute",
            top: "10px",
            right: "10px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            zIndex: 2,
        },
        iconButton: {
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            borderRadius: "50%",
            padding: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "18px",
            color: "#333",
            transition: "background-color 0.3s ease, transform 0.3s ease",
        },
        iconButtonHover: {
            backgroundColor: "#28a745",
            color: "#fff",
            transform: "scale(1.1)",
        },
        name: {
            fontSize: "1.5rem",
            fontWeight: "600",
            color: cartHovered ? "#333" : "#28a745",
            transition: "color 0.3s ease",
            marginTop: "5px",
        },
        priceContainer: {
            textAlign: "center",
            marginTop: "3px",
        },
        price: {
            fontSize: "1.2rem",
            fontWeight: "bold",
            color: "#28a745",
        },
        oldPrice: {
            fontSize: "1rem",
            color: "#ff4c4c",
            textDecoration: "line-through",
            marginTop: "-10px",
            display: "block",
        },
        ratingStars: {
            display: "flex",
            justifyContent: "center",
            marginBottom: "5px",
        },
        addToCartButton: {
            backgroundColor: cartHovered ? "#333" : "#28a745",
            color: "#fff",
            padding: "10px 20px",
            borderRadius: "30px",
            fontSize: "0.9rem",
            fontWeight: "600",
            cursor: "pointer",
            border: "none",
            position: "absolute",
            bottom: "-20px",
            left: "50%",
            transform: "translate(-50%, 0)",
            display: hovered ? "flex" : "none",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            transition: "background-color 0.3s ease, transform 0.3s ease",
        },
        content: {
            padding: "20px",
            textAlign: "center",
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
        },
    };

    return (
        <div
            style={styles.card}
            onClick={handleClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <div style={styles.imageContainer}>
                <img src={imageUrl} alt={name} style={styles.image} />
                {discountPercentage > 0 && (
                    <div style={styles.discountLabel}>
                        <span style={styles.discountText}>{discountPercentage}%</span>
                        <span style={styles.percentSymbol}>OFF</span>
                    </div>
                )}
                <div style={styles.iconContainer}>
                    <div
                        style={{
                            ...styles.iconButton,
                            ...(hovered ? styles.iconButtonHover : {}),
                        }}
                        title="Add to Wishlist"
                        onClick={handleAddToWishlist}
                    >
                        <FiHeart />
                    </div>
                    <div style={styles.iconButton} title="Compare">
                        <FiShuffle />
                    </div>
                    <div style={styles.iconButton} title="Quick View">
                        <FiSearch />
                    </div>
                </div>
            </div>
            <div style={styles.content}>
                <div className="product-name" style={styles.name}>{name}</div>
                <div style={styles.ratingStars}>{renderStars(rating)}</div>
                <div style={styles.priceContainer}>
                    {discountPercentage > 0 ? (
                        <>
                            <span style={styles.price}>R{discountedPrice}</span>
                            <span style={styles.oldPrice}>R{price}</span>
                        </>
                    ) : (
                        <span style={styles.price}>R{price}</span>
                    )}
                </div>
            </div>
            <button
                style={styles.addToCartButton}
                onClick={handleAddToCart}
                onMouseEnter={() => setCartHovered(true)}
                onMouseLeave={() => setCartHovered(false)}
            >
                <FiShoppingCart style={{ marginRight: "8px" }} /> Add to Cart
            </button>
        </div>
    );
};

export default ProductCard;
