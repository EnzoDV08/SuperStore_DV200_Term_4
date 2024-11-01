// src/pages/ProductsPage.js

import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { firestore } from "../firebaseConfig";
import { collection, onSnapshot } from "firebase/firestore";
import ProductCard from "../components/ProductCard";

const ProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const location = useLocation();
    const filter = new URLSearchParams(location.search).get("filter");


    // Extract search term from URL query parameters
    const query = new URLSearchParams(location.search).get("search") || "";

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(firestore, "products"), (snapshot) => {
            const productList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setProducts(productList);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const filterResults = () => {
            let results;
            if (query.length === 1) {
                results = products.filter(product =>
                    product.name.toLowerCase().startsWith(query.toLowerCase())
                );
            } else if (query.length > 1) {
                results = products.filter(product =>
                    product.name.toLowerCase().includes(query.toLowerCase())
                );
            } else {
                results = products;
            }
            setFilteredProducts(results);
        };
        filterResults();
    }, [query, products]);

    useEffect(() => {
    const filterResults = () => {
        let results = products;
        
        if (query) {
            results = results.filter(product =>
                product.name.toLowerCase().includes(query.toLowerCase())
            );
        }

        if (filter === "new") {
            // Assuming you have a date field like `createdAt` in your product data
            results = results.sort((a, b) => b.createdAt - a.createdAt);
        } else if (filter === "best_sales") {
            // Assuming you have a field like `soldCount` for best sales
            results = results.sort((a, b) => b.soldCount - a.soldCount);
        } else if (filter === "special_offers") {
            // Assuming you have a field like `discountPercentage` to check for offers
            results = results.filter(product => product.discountPercentage > 0);
        }

        setFilteredProducts(results);
    };
    filterResults();
}, [query, filter, products]);


    const styles = {
        container: {
            padding: "20px",
            textAlign: "center",
        },
        heading: {
            fontSize: "2rem",
            marginBottom: "1rem",
        },
        productGrid: {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "20px",
            padding: "20px 0",
        },
        productCard: (index) => ({
            opacity: 0,
            transform: "translateX(300px)",
            animation: `slideIn 0.4s ease-out forwards`,
            animationDelay: `${index * 0.08}s`,
        }),
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.heading}>Our Products</h2>
            <div style={styles.productGrid}>
                {filteredProducts.map((product, index) => (
                    <div
                        key={product.id}
                        style={styles.productCard(index)}
                    >
                        <ProductCard product={product} />
                    </div>
                ))}
            </div>
            <style>
                {`
                @keyframes slideIn {
                    0% {
                        opacity: 0;
                        transform: translateX(300px);
                    }
                    100% {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                `}
            </style>
        </div>
    );
};

export default ProductsPage;
