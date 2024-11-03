import React, { useState, useEffect } from "react";
import { auth, firestore } from "../firebaseConfig";
import { collection, query, onSnapshot } from "firebase/firestore";
import ProductCard from "../components/ProductCard";

const Wishlist = () => {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWishlistItems = () => {
            const user = auth.currentUser;
            if (user) {
                const wishlistQuery = query(
                    collection(firestore, "users", user.uid, "wishlist")
                );

                const unsubscribe = onSnapshot(wishlistQuery, (snapshot) => {
                    const items = snapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    }));
                    setWishlistItems(items);
                    setLoading(false);
                });

                return () => unsubscribe();
            }
        };

        fetchWishlistItems();
    }, []);

    if (loading) {
        return <p>Loading wishlist...</p>;
    }

    return (
        <div style={styles.container}>
            <h2 style={styles.heading}>Your Wishlist</h2>
            {wishlistItems.length === 0 ? (
                <p>Your wishlist is empty.</p>
            ) : (
                <div style={styles.cardContainer}>
                    {wishlistItems.map((item) => (
                        <ProductCard key={item.id} product={item} />
                    ))}
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        padding: "40px",
        maxWidth: "1200px",
        margin: "0 auto",
    },
    heading: {
        fontSize: "2rem",
        marginBottom: "20px",
        textAlign: "center",
    },
    cardContainer: {
        display: "flex",
        flexWrap: "wrap",
        gap: "20px",
        justifyContent: "center",
    },
};

export default Wishlist;
