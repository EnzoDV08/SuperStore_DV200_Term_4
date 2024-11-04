// src/components/Filter.js

import React, { useState } from "react";

const Filter = () => {
    const [priceRange, setPriceRange] = useState([10, 100]);

    const handleSliderChange = (e) => {
        const [min, max] = e.target.value.split(",").map(Number);
        setPriceRange([min, max]);
    };

    const styles = {
        container: {
            backgroundColor: "#f5f8fa",
            padding: "20px",
            borderRadius: "10px",
            textAlign: "center",
            marginBottom: "20px",
        },
        heading: {
            backgroundColor: "#32CD32",
            color: "#fff",
            borderRadius: "8px",
            padding: "8px",
            fontWeight: "bold",
        },
        slider: {
            width: "100%",
            marginTop: "15px",
        },
        filterButton: {
            marginTop: "10px",
            padding: "10px 20px",
            borderRadius: "8px",
            backgroundColor: "#32CD32",
            color: "#fff",
            fontWeight: "bold",
            cursor: "pointer",
            border: "none",
        },
    };

    return (
        <div style={styles.container}>
            <h3 style={styles.heading}>Filter by Price</h3>
            <input
                type="range"
                min="10"
                max="100"
                value={priceRange}
                onChange={handleSliderChange}
                style={styles.slider}
                multiple
            />
            <p>Price: ${priceRange[0]} — ${priceRange[1]}</p>
            <button style={styles.filterButton}>Filter</button>
        </div>
    );
};

export default Filter;
