// src/components/Filter.js

import React, { useState } from "react";

const Filter = ({ onPriceRangeChange }) => {
    const [minPrice, setMinPrice] = useState(10);
    const [maxPrice, setMaxPrice] = useState(10000);

    const handlePriceChange = () => {
        onPriceRangeChange([minPrice, maxPrice]);
    };

    const handlePresetClick = (range) => {
        setMinPrice(range[0]);
        setMaxPrice(range[1]);
        onPriceRangeChange(range);
    };

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
        inputContainer: {
            display: "flex",
            justifyContent: "center",
            gap: "10px",
            marginBottom: "15px",
        },
        input: {
            width: "100px",
            padding: "8px",
            borderRadius: "8px",
            border: "1px solid #ddd",
            fontSize: "1rem",
            textAlign: "center",
        },
        presetContainer: {
            display: "flex",
            gap: "10px",
            justifyContent: "center",
            marginTop: "15px",
        },
        presetButton: {
            padding: "8px 16px",
            borderRadius: "8px",
            backgroundColor: "#e0e0e0",
            color: "#333",
            cursor: "pointer",
            border: "none",
            transition: "background-color 0.3s ease",
        },
        presetButtonActive: {
            backgroundColor: "#32CD32",
            color: "#fff",
        },
        filterButton: {
            marginTop: "15px",
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
            <div style={styles.inputContainer}>
                <input
                    type="number"
                    value={minPrice}
                    min="0"
                    max={maxPrice}
                    onChange={(e) => setMinPrice(Number(e.target.value))}
                    placeholder="Min R"
                    style={styles.input}
                />
                <span>—</span>
                <input
                    type="number"
                    value={maxPrice}
                    min={minPrice}
                    max="10000"
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    placeholder="Max R"
                    style={styles.input}
                />
            </div>
            <button style={styles.filterButton} onClick={handlePriceChange}>
                Apply
            </button>
            <div style={styles.presetContainer}>
                <button
                    style={{ ...styles.presetButton, ...(minPrice === 0 && maxPrice === 500 ? styles.presetButtonActive : {}) }}
                    onClick={() => handlePresetClick([0, 500])}
                >
                    Under R500
                </button>
                <button
                    style={{ ...styles.presetButton, ...(minPrice === 500 && maxPrice === 2000 ? styles.presetButtonActive : {}) }}
                    onClick={() => handlePresetClick([500, 2000])}
                >
                    R500 - R2000
                </button>
                <button
                    style={{ ...styles.presetButton, ...(minPrice === 2000 ? styles.presetButtonActive : {}) }}
                    onClick={() => handlePresetClick([2000, 10000])}
                >
                    Above R2000
                </button>
            </div>
        </div>
    );
};

export default Filter;
