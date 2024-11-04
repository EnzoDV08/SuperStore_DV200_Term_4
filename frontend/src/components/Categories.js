// src/components/Categories.js

import React from "react";

const Categories = () => {
    const categories = [
        "Bestsellers",
        "Breads & Sweets",
        "Cleaning Materials",
        "Fishes & Raw Meats",
        "Fruits & Vegetables",
        "Milks & Proteins",
        "Others",
        "Supermarket",
        "Uncategorized",
    ];

    const styles = {
        container: {
            backgroundColor: "#f5f8fa",
            padding: "20px",
            borderRadius: "10px",
            textAlign: "center",
        },
        heading: {
            backgroundColor: "#32CD32",
            color: "#fff",
            borderRadius: "8px",
            padding: "8px",
            fontWeight: "bold",
        },
        list: {
            listStyleType: "none",
            padding: "0",
            margin: "10px 0",
            textAlign: "left",
        },
        listItem: {
            padding: "5px 0",
        },
    };

    return (
        <div style={styles.container}>
            <h3 style={styles.heading}>Product Categories</h3>
            <ul style={styles.list}>
                {categories.map((category, index) => (
                    <li key={index} style={styles.listItem}>
                        {category}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Categories;
