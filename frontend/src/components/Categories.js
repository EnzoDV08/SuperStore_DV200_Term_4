import React, { useState } from "react";

const Categories = () => {
    const categories = [
        "Electronics",
        "Fashion & Apparel",
        "Home & Kitchen",
        "Health & Beauty",
        "Sports & Outdoors",
        "Toys & Games",
        "Books & Stationery",
        "Automotive",
        "Pet Supplies",
        "Jewelry & Accessories",
        "Office Supplies",
        "Grocery & Food",
        "Baby & Kids",
        "Furniture",
        "Gardening",
        "Footwear",
    ];

    const [hoveredIndex, setHoveredIndex] = useState(null);

    const styles = {
        container: {
            backgroundColor: "#f9fbfc",
            padding: "20px",
            borderRadius: "12px",
            textAlign: "center",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        },
        heading: {
            backgroundColor: "#32CD32",
            color: "#fff",
            borderRadius: "8px",
            padding: "10px",
            fontWeight: "bold",
            fontSize: "1.2rem",
            marginBottom: "15px",
        },
        list: {
            listStyleType: "none",
            padding: "0",
            margin: "0",
            textAlign: "left",
        },
        listItem: {
            padding: "10px",
            fontSize: "1rem",
            color: "#333",
            borderRadius: "8px",
            cursor: "pointer",
            transition: "background-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
        },
        listItemHover: {
            backgroundColor: "#32CD32",
            color: "#fff",
            transform: "scale(1.05)",
            boxShadow: "0 4px 8px rgba(50, 205, 50, 0.3)",
        },
        icon: {
            marginLeft: "auto",
            color: "inherit",
            transition: "transform 0.3s ease",
        },
        iconHover: {
            transform: "translateX(5px)",
        },
    };

    return (
        <div style={styles.container}>
            <h3 style={styles.heading}>Product Categories</h3>
            <ul style={styles.list}>
                {categories.map((category, index) => (
                    <li
                        key={index}
                        style={{
                            ...styles.listItem,
                            ...(hoveredIndex === index ? styles.listItemHover : {}),
                        }}
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                    >
                        {category}
                        <span
                            style={{
                                ...styles.icon,
                                ...(hoveredIndex === index ? styles.iconHover : {}),
                            }}
                        >
                            →
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Categories;
