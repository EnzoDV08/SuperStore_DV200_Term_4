// src/pages/ProductsPage.js

import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { firestore } from "../firebaseConfig";
import { collection, onSnapshot } from "firebase/firestore";
import LargeProductCard from "../components/LargeProductCard";
import Filter from "../components/Filter";
import Categories from "../components/Categories";


const ProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const location = useLocation();
    const filter = new URLSearchParams(location.search).get("filter");
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
            if (query.length > 0) {
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
                results = results.sort((a, b) => b.createdAt - a.createdAt);
            } else if (filter === "best_sales") {
                results = results.sort((a, b) => b.soldCount - a.soldCount);
            } else if (filter === "special_offers") {
                results = results.filter(product => product.discountPercentage > 0);
            }

            setFilteredProducts(results);
        };
        filterResults();
    }, [query, filter, products]);

    const styles = {
         container: { display: "flex", justifyContent: "center", padding: "20px", marginTop: "60px" },
         rightSidebar: { width: "25%", padding: "10px", marginLeft: "-120px" },
        mainContent: { width: "60%", padding: "10px" },
        heading: {
            fontSize: "2rem",
            marginBottom: "1rem",
        },
        productGrid: {
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "10px",
            marginRight: "100px",
            marginLeft: "100px",
        },
         dropdownContainer: {
            display: "flex",
            justifyContent: "flex-start",
            gap: "10px",
            marginBottom: "20px",
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
            <div style={styles.mainContent}>
                <div style={styles.dropdownContainer}>
                    <select>
                        <option>16 Products</option>
                        <option>32 Products</option>
                    </select>
                    <select>
                        <option>Popular</option>
                        <option>Newest</option>
                    </select>
                </div>
                <div style={styles.productGrid}>
                    {filteredProducts.map((product) => (
                        <LargeProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
            <div style={styles.rightSidebar}>
                <Filter />
                <Categories />
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
