// src/pages/HotDeals.js
import React, { useEffect, useState } from "react";
import { firestore } from "../firebaseConfig";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import ProductCard from "../components/ProductCard";

const HotDeals = () => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const hotDealsQuery = query(
            collection(firestore, "products"),
            where("discountPercentage", ">", 0) // Filter products with discounts
        );

        const unsubscribe = onSnapshot(hotDealsQuery, (snapshot) => {
            const productList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setProducts(productList);
        });

        return () => unsubscribe();
    }, []);

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
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.heading}>Hot Deals</h2>
            <div style={styles.productGrid}>
                {products.map((product) => 
                    product ? <ProductCard key={product.id} product={product} /> : null
                )}
            </div>
        </div>
    );
};

export default HotDeals;
