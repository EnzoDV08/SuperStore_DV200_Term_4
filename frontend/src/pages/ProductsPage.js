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
    const [priceRange, setPriceRange] = useState([10, 10000]);
    const location = useLocation();

    useEffect(() => {
        const q = collection(firestore, "products");
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const productList = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setProducts(productList);
            setFilteredProducts(productList); // Display all products by default
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        applyFilter();
    }, [priceRange, products, location]);

    const applyFilter = () => {
        let results = [...products];

        // Handle specific navigation filters (new, best sales, special offers)
        const searchParams = new URLSearchParams(location.search);
        if (searchParams.get("filter") === "new") {
            results = results.sort((a, b) => b.createdAt - a.createdAt);
        } else if (searchParams.get("filter") === "best_sales") {
            results = results.sort((a, b) => b.soldCount - a.soldCount);
        } else if (searchParams.get("filter") === "special_offers") {
            results = results.filter((product) => product.discount > 0);
        }

        // Price range filter if not at default range
        if (priceRange[0] !== 10 || priceRange[1] !== 10000) {
            results = results.filter(
                (product) => product.price >= priceRange[0] && product.price <= priceRange[1]
            );
        }

        setFilteredProducts(results);
    };

    const styles = {
             container: { display: "flex", justifyContent: "center", padding: "20px", marginTop: "60px" },
        rightSidebar: { width: "25%", padding: "10px", marginLeft: "20px" },
        mainContent: { width: "60%", padding: "10px" },
        productGrid: {
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "10px",
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
                    {filteredProducts.map((product, index) => (
                        <div key={product.id} style={styles.productCard(index)}>
                            <LargeProductCard product={product} />
                        </div>
                    ))}
                </div>
            </div>
            <div style={styles.rightSidebar}>
                <Filter onPriceRangeChange={setPriceRange} />
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
