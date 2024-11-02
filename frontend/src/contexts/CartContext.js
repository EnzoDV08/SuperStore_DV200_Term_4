import React, { createContext, useState, useEffect } from "react";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { firestore } from "../firebaseConfig";
import { useAuth } from "./AuthContext";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const user = useAuth();
    const [cart, setCart] = useState([]);
    const cartDocRef = user ? doc(firestore, "carts", user.uid) : null;

    // Load cart from Firestore when the component mounts or the user changes
    useEffect(() => {
        const loadCart = async () => {
            if (user && cartDocRef) {
                const cartDoc = await getDoc(cartDocRef);
                if (cartDoc.exists()) {
                    setCart(cartDoc.data().items || []);
                }
            }
        };
        loadCart();
    }, [user, cartDocRef]);

    // Save cart to Firestore whenever it changes
    useEffect(() => {
        if (user && cartDocRef) {
            const saveCartToFirestore = async () => {
                try {
                    await setDoc(cartDocRef, { items: cart }, { merge: true });
                } catch (error) {
                    console.error("Error saving cart to Firestore:", error);
                }
            };
            saveCartToFirestore();
        }
    }, [cart, user, cartDocRef]);

    // Function to add a product to the cart
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

    // Function to update quantity in local cart state
    const updateQuantity = (productId, quantity) => {
        setCart((prevCart) =>
            prevCart.map((item) =>
                item.id === productId ? { ...item, quantity: Math.max(item.quantity + quantity, 1) } : item
            )
        );
    };

    // Function to remove item from cart
    const removeFromCart = (productId) => {
        setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
    };

    // Function to clear the cart
    const clearCart = () => {
        setCart([]);
        if (user && cartDocRef) {
            setDoc(cartDocRef, { items: [] }, { merge: true });
        }
    };

    // Function to handle checkout and update stock in Firestore
    const checkoutCart = async () => {
        try {
            for (const item of cart) {
                const productRef = doc(firestore, "products", item.id);
                await updateDoc(productRef, {
                    stock: item.stock - item.quantity,
                });
            }
            alert("Purchase completed! Stock updated.");
            clearCart(); // Clear cart after checkout
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
