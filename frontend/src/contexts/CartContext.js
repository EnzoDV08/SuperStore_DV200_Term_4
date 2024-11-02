import React, { createContext, useState, useEffect } from "react";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { firestore } from "../firebaseConfig";
import { useAuth } from "./AuthContext";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const user = useAuth();
    const [cart, setCart] = useState([]);
    const [initialized, setInitialized] = useState(false); // Track initialization

    // Load cart from Firestore or localStorage once on mount or user change
    useEffect(() => {
        const loadCart = async () => {
            const savedCart = localStorage.getItem("cart");
            if (savedCart) {
                setCart(JSON.parse(savedCart));
            } else if (user) {
                const cartDocRef = doc(firestore, "carts", user.uid);
                const cartDoc = await getDoc(cartDocRef);
                if (cartDoc.exists()) {
                    const items = cartDoc.data().items || [];
                    setCart(items);
                    localStorage.setItem("cart", JSON.stringify(items));
                }
            }
            setInitialized(true); // Mark as initialized after loading
        };
        loadCart();
    }, [user]);

    // Save to Firestore and localStorage only if cart has been initialized
    useEffect(() => {
        if (user && initialized) {
            const cartDocRef = doc(firestore, "carts", user.uid);
            const saveCartToFirestore = async () => {
                try {
                    await setDoc(cartDocRef, { items: cart }, { merge: true });
                } catch (error) {
                    console.error("Error saving cart to Firestore:", error);
                }
            };
            saveCartToFirestore();
        }
        if (initialized) {
            localStorage.setItem("cart", JSON.stringify(cart)); // Update localStorage
        }
    }, [cart, user, initialized]);

    // Cart manipulation functions
    const addToCart = (product) => {
        setCart((prevCart) => {
            const existingProduct = prevCart.find((item) => item.id === product.id);
            if (existingProduct) {
                return prevCart.map((item) =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            } else {
                return [...prevCart, { ...product, quantity: 1 }];
            }
        });
    };

    const updateQuantity = (productId, quantity) => {
        setCart((prevCart) =>
            prevCart.map((item) =>
                item.id === productId ? { ...item, quantity: Math.max(item.quantity + quantity, 1) } : item
            )
        );
    };

    const removeFromCart = (productId) => {
        setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
    };

    const clearCart = () => {
        setCart([]);
        if (user) {
            const cartDocRef = doc(firestore, "carts", user.uid);
            setDoc(cartDocRef, { items: [] }, { merge: true });
        }
        localStorage.removeItem("cart");
    };

    const checkoutCart = async () => {
        try {
            for (const item of cart) {
                const productRef = doc(firestore, "products", item.id);
                await updateDoc(productRef, {
                    stock: item.stock - item.quantity,
                });
            }
            alert("Purchase completed! Stock updated.");
            clearCart();
        } catch (error) {
            console.error("Error updating stock on checkout:", error);
        }
    };

    return (
        <CartContext.Provider value={{ cart, addToCart, updateQuantity, removeFromCart, clearCart, checkoutCart }}>
            {children}
        </CartContext.Provider>
    );
};
