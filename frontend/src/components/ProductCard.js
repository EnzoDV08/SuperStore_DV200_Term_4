// src/components/ProductCard.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiHeart, FiShuffle, FiSearch, FiShoppingCart } from "react-icons/fi";
import { FaStar, FaRegStar, FaStarHalfAlt } from "react-icons/fa";

const ProductCard = ({ product = {} }) => {
    const navigate = useNavigate();
    const [hovered, setHovered] = useState(false);
    const [cartHovered, setCartHovered] = useState(false);

    const handleClick = () => {
        navigate(`/product/${product.id || ""}`); // Safe navigation even if ID is missing
    };

    // Fallback values for properties
    const imageUrl = product?.imageUrl || "https://via.placeholder.com/280x250";
    const name = product?.name || product?.title || "Product Name";
    const rating = product?.rating || 0;
    const price = product?.price ? product.price.toFixed(2) : "N/A";

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
             borderRadius: "35px 0 35px 0", // Apply rounding to top-left and bottom-left corners
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            cursor: "pointer",
            transition: "transform 0.4s ease, box-shadow 0.4s ease",
            overflow: "visible",
            backgroundColor: "#fff",
            display: "flex",
            flexDirection: "column",
            transform: hovered ? "scale(1.05)" : "scale(1)",
            marginBottom:'20px',
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
            marginTop: "10px",
        },
        priceAndRating: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            fontSize: "1rem",
            color: "#333",
            margin: "10px 0",
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
                <img
                    src={imageUrl}
                    alt={name}
                    style={styles.image}
                />
                <div style={styles.iconContainer}>
                    {[{ icon: FiHeart, title: "Add to Wishlist" }, { icon: FiShuffle, title: "Compare" }, { icon: FiSearch, title: "Quick View" }].map(
                        ({ icon: Icon, title }, index) => (
                            <div
                                key={index}
                                style={{
                                    ...styles.iconButton,
                                    ...(hovered ? styles.iconButtonHover : {}),
                                }}
                                title={title}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = "#28a745";
                                    e.currentTarget.style.color = "#fff";
                                    e.currentTarget.style.transform = "scale(1.1)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
                                    e.currentTarget.style.color = "#333";
                                    e.currentTarget.style.transform = "scale(1)";
                                }}
                            >
                                <Icon />
                            </div>
                        )
                    )}
                </div>
            </div>
            <div style={styles.content}>
                <div className="product-name" style={styles.name}>
                    {name}
                </div>
                <div style={styles.priceAndRating}>
                    <div>{renderStars(rating)}</div>
                    <div>R{price}</div>
                </div>
            </div>
            <button
                style={styles.addToCartButton}
                onClick={(e) => {
                    e.stopPropagation();
                    alert("Added to cart");
                }}
                onMouseEnter={() => setCartHovered(true)}
                onMouseLeave={() => setCartHovered(false)}
            >
                <FiShoppingCart style={{ marginRight: "8px" }} /> Add to Cart
            </button>
        </div>
    );
};

export default ProductCard;