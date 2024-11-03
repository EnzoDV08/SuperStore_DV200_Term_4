import React, { createContext, useState, useEffect } from "react";
import { doc, getDoc, setDoc, updateDoc, addDoc, collection } from "firebase/firestore";
import { firestore } from "../firebaseConfig";
import { useAuth } from "./AuthContext";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const user = useAuth();
    const [cart, setCart] = useState([]);
    const [initialized, setInitialized] = useState(false);

    // Load cart from Firestore or localStorage on initialization
    useEffect(() => {
        const loadCart = async () => {
            if (user) {
                const cartRef = doc(firestore, "carts", user.uid);
                const cartDoc = await getDoc(cartRef);
                if (cartDoc.exists()) {
                    const items = cartDoc.data().items || [];
                    setCart(items);
                    localStorage.setItem("cart", JSON.stringify(items));
                } else {
                    setCart([]);
                }
            } else {
                const savedCart = localStorage.getItem("cart");
                if (savedCart) {
                    setCart(JSON.parse(savedCart));
                }
            }
            setInitialized(true);
        };
        loadCart();
    }, [user]);

    // Save cart to Firestore and localStorage whenever cart changes
    useEffect(() => {
        const saveCartToFirestore = async () => {
            if (user && initialized) {
                const cartRef = doc(firestore, "carts", user.uid);
                try {
                    await setDoc(cartRef, { items: cart }, { merge: true });
                } catch (error) {
                    console.error("Error saving cart to Firestore:", error);
                }
            }
            if (initialized) {
                localStorage.setItem("cart", JSON.stringify(cart));
            }
        };
        saveCartToFirestore();
    }, [cart, user, initialized]);

    // Calculate total price of cart items
    const calculateTotal = () => {
        return cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
    };

    // Add item to cart
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

    // Update quantity of an item in cart
    const updateQuantity = (productId, quantity) => {
        setCart((prevCart) =>
            prevCart.map((item) =>
                item.id === productId ? { ...item, quantity: Math.max(item.quantity + quantity, 1) } : item
            )
        );
    };

    // Remove item from cart
    const removeFromCart = (productId) => {
        setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
    };

    // Clear cart
    const clearCart = () => {
        setCart([]);
        if (user) {
            const cartRef = doc(firestore, "carts", user.uid);
            setDoc(cartRef, { items: [] }, { merge: true });
        }
        localStorage.removeItem("cart");
    };

    // Checkout and place an order
    const checkoutCart = async () => {
        if (!user) return;

        try {
            const orderData = {
                buyerId: user.uid,
                items: cart.map(item => ({
                    productId: item.id,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                    sellerId: item.sellerId
                })),
                totalAmount: parseFloat(calculateTotal()),
                isPaid: true,
                isApprovedBySeller: false,
                createdAt: new Date()
            };
            await addDoc(collection(firestore, "orders"), orderData);

            // Update stock for each product in the cart
            for (const item of cart) {
                const productRef = doc(firestore, "products", item.id);
                await updateDoc(productRef, { stock: item.stock - item.quantity });
            }
            alert("Order placed successfully! Awaiting seller approval.");
            clearCart();
        } catch (error) {
            console.error("Error placing order: ", error);
        }
    };

    return (
        <CartContext.Provider value={{ cart, addToCart, updateQuantity, removeFromCart, clearCart, checkoutCart }}>
            {children}
        </CartContext.Provider>
    );
};
