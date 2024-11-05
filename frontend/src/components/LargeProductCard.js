import React, { useState } from "react";
import { FiHeart, FiShuffle, FiSearch, FiShoppingCart } from "react-icons/fi";
import { FaStar, FaRegStar, FaStarHalfAlt } from "react-icons/fa";
import { doc, setDoc } from "firebase/firestore";
import { firestore, auth } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";

const LargeProductCard = ({ product = {} }) => {
    const navigate = useNavigate();
    const [hovered, setHovered] = useState(false);
    const [cartHovered, setCartHovered] = useState(false);
    const [wishlistAdded, setWishlistAdded] = useState(false); // Track wishlist status
    const [iconHovered, setIconHovered] = useState(null); // To track hover state for each icon

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
            price: product.discountedPrice || product.price,
            category: product.category || "Uncategorized",
            addedAt: new Date(),
        };

        try {
            await setDoc(wishlistRef, wishlistItem);
            setWishlistAdded(true); // Change state to indicate addition to wishlist
        } catch (error) {
            console.error("Error adding to wishlist:", error);
        }
    };

    const handleQuickView = (e) => {
        e.stopPropagation();
        navigate(`/product/${product.id}`);
    };

    const handleCompare = (e) => {
        e.stopPropagation();
        navigate('/compare');
    };

    const imageUrl = product?.imageUrl || "https://via.placeholder.com/350x300";
    const name = product?.name || "Product Name";
    const rating = product?.rating || 0;
    const price = product?.price ? product.price.toFixed(2) : "N/A";
    const discount = product?.discount || 0;
    const discountedPrice = discount > 0 ? (price - (price * discount) / 100).toFixed(2) : price;

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
            maxWidth: "400px",
            height: "520px",
            borderRadius: "35px 0 35px 0",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            cursor: "pointer",
            transition: "transform 0.4s ease, box-shadow 0.4s ease",
            overflow: "visible",
            backgroundColor: "#fff",
            display: "flex",
            flexDirection: "column",
            transform: hovered ? "scale(1.05)" : "scale(1)",
            marginBottom: "50px",
        },
        imageContainer: {
            position: "relative",
            overflow: "hidden",
            borderTopLeftRadius: "35px",
        },
        image: {
            width: "100%",
            height: "320px",
            objectFit: "cover",
            transition: "transform 0.4s ease",
            transform: hovered ? "scale(1.1)" : "scale(1)",
        },
        discountLabel: {
            position: "absolute",
            top: "15px",
            left: "15px",
            backgroundColor: "#ff4c4c",
            color: "#fff",
            padding: "10px 16px",
            fontWeight: "bold",
            fontSize: "16px",
            borderRadius: "8px 0 0 8px",
            zIndex: 1,
            clipPath: "polygon(0 0, 100% 0, 85% 100%, 0% 100%)",
        },
        iconContainer: {
            position: "absolute",
            top: "15px",
            right: "15px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            zIndex: 2,
        },
        iconButton: (hovering) => ({
            backgroundColor: hovering ? "#28a745" : "rgba(255, 255, 255, 0.9)",
            borderRadius: "50%",
            padding: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
            color: hovering ? "#fff" : "#333",
            cursor: "pointer",
            transition: "background-color 0.3s ease, transform 0.3s ease",
            transform: hovering ? "scale(1.1)" : "scale(1)",
        }),
        name: {
            fontSize: "1.75rem",
            fontWeight: "600",
            color: "#28a745",
            marginTop: "10px",
            textAlign: "center",
        },
        priceContainer: {
            textAlign: "center",
            marginTop: "8px",
        },
        price: {
            fontSize: "1.5rem",
            fontWeight: "bold",
            color: "#28a745",
        },
        oldPrice: {
            fontSize: "1.2rem",
            color: "#ff4c4c",
            textDecoration: "line-through",
            marginTop: "-10px",
            display: "block",
        },
        ratingStars: {
            display: "flex",
            justifyContent: "center",
            marginBottom: "10px",
        },
        addToCartButton: {
            backgroundColor: cartHovered ? "#333" : "#28a745",
            color: "#fff",
            padding: "12px 24px",
            borderRadius: "30px",
            fontSize: "1rem",
            fontWeight: "600",
            cursor: "pointer",
            border: "none",
            position: "absolute",
            bottom: "-25px",
            left: "50%",
            transform: "translate(-50%, 0)",
            display: hovered ? "flex" : "none",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
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
      outOfStockLabel: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "rgba(255, 0, 0, 0.85)",  // Bold red with slight transparency
    color: "#fff",
    padding: "20px 50px",
    fontSize: "1.8rem",
    fontWeight: "bold",
    textAlign: "center",
    borderRadius: "10px",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.3)",  // Shadow for depth
    letterSpacing: "1px",  // Slight letter spacing for emphasis
    zIndex: 3,
    textTransform: "uppercase",  // All uppercase for a stronger impact
    pointerEvents: "none",  // Prevent clicks on the label
},
    };

     return (
        <div
            style={styles.card}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={() => navigate(`/product/${product.id}`)} // Navigate to ProductDetails on card click
        >
            <div style={styles.imageContainer}>
                <img src={imageUrl} alt={name} style={styles.image} />
                  {/* Out of Stock Label */}
            {product.stock === 0 && (
                <div style={styles.outOfStockLabel}>Out of Stock</div>
            )}

            {discount > 0 && (
                <div style={styles.discountLabel}>{discount}% OFF</div>
            )}
                <div style={styles.iconContainer}>
                    <div
                        style={styles.iconButton(iconHovered === 'wishlist')}
                        onClick={handleAddToWishlist}
                        onMouseEnter={() => setIconHovered('wishlist')}
                        onMouseLeave={() => setIconHovered(null)}
                        title="Add to Wishlist"
                    >
                        <FiHeart />
                    </div>
                    <div
                        style={styles.iconButton(iconHovered === 'compare')}
                        onClick={handleCompare} // Navigate to Compare.js
                        onMouseEnter={() => setIconHovered('compare')}
                        onMouseLeave={() => setIconHovered(null)}
                        title="Compare"
                    >
                        <FiShuffle />
                    </div>
                    <div
                        style={styles.iconButton(iconHovered === 'quickview')}
                        onClick={handleQuickView} // Navigate to ProductDetails
                        onMouseEnter={() => setIconHovered('quickview')}
                        onMouseLeave={() => setIconHovered(null)}
                        title="Quick View"
                    >
                        <FiSearch />
                    </div>
                </div>
            </div>
            <div style={styles.content}>
                <div style={styles.name}>{name}</div>
                <div style={styles.ratingStars}>{renderStars(rating)}</div>
                <div style={styles.priceContainer}>
                    {discount > 0 ? (
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
                onMouseEnter={() => setCartHovered(true)}
                onMouseLeave={() => setCartHovered(false)}
            >
                <FiShoppingCart /> Add to Cart
            </button>
        </div>
    );
};

export default LargeProductCard;
