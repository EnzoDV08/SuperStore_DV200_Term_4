// src/pages/CheckoutPage.js
import React, { useContext, useEffect, useState } from 'react';
import { CartContext } from '../contexts/CartContext';
import { firestore } from '../firebaseConfig';
import { collection, doc, updateDoc, addDoc } from 'firebase/firestore';
import { auth } from '../firebaseConfig';

const CheckoutPage = () => {
    const { cart: contextCart, removeFromCart, updateQuantity, clearCart } = useContext(CartContext);
    const [cart, setCart] = useState(contextCart);

    // Load cart from localStorage if context cart is empty
    useEffect(() => {
        if (contextCart.length === 0) {
            const savedCart = localStorage.getItem("cart");
            if (savedCart) setCart(JSON.parse(savedCart));
        } else {
            setCart(contextCart);
        }
    }, [contextCart]);

    const calculateTotal = () => {
        return cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
    };

    const calculateDiscount = () => {
        return cart.reduce((total, item) => {
            const discountAmount = (item.price * item.discountPercentage) / 100;
            return total + discountAmount * item.quantity;
        }, 0).toFixed(2);
    };

    const total = calculateTotal();
    const totalDiscount = calculateDiscount();
    const finalTotal = (total - totalDiscount).toFixed(2);

    const placeOrder = async () => {
        if (!cart || cart.length === 0) return; // Prevents empty orders

        alert('Processing fake payment...');
        try {
            const user = auth.currentUser;

            // Create a new order document in Firestore
            const orderData = {
                userId: user.uid,
                items: cart.map((item) => ({
                    id: item.id,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                    discountPercentage: item.discountPercentage,
                })),
                totalAmount: parseFloat(finalTotal),
                status: 'Pending',
                createdAt: new Date(),
                sellerId: cart[0]?.sellerId || "", // Assuming each item has a sellerId, this could be modified if needed
            };

            // Add the order to Firestore
            await addDoc(collection(firestore, "orders"), orderData);

            // Update product stock in Firestore
            for (const item of cart) {
                const productRef = doc(firestore, 'products', item.id);
                await updateDoc(productRef, {
                    stock: item.stock - item.quantity,
                });
            }

            alert('Order placed successfully!');
            clearCart();
        } catch (error) {
            console.error("Error placing order: ", error);
            alert("Failed to place order. Please try again.");
        }
    };

    const styles = {
        checkoutPage: {
            maxWidth: '800px',
            margin: '0 auto',
            padding: '20px',
            fontFamily: 'Arial, sans-serif',
        },
        header: {
            textAlign: 'center',
            marginBottom: '20px',
        },
        cartItems: {
            border: '1px solid #ddd',
            padding: '10px',
            borderRadius: '5px',
            marginBottom: '20px',
        },
        cartItem: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 0',
            borderBottom: '1px solid #ddd',
        },
        itemName: {
            fontWeight: 'bold',
            textAlign: 'center',
            flex: '1',
        },
        itemPrice: {
            flex: '1',
            textAlign: 'center',
        },
        quantityControl: {
            display: 'flex',
            alignItems: 'center',
        },
        quantityButton: {
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            padding: '5px 10px',
            cursor: 'pointer',
            borderRadius: '3px',
            margin: '0 5px',
        },
        removeButton: {
            backgroundColor: '#ff4c4c',
            color: 'white',
            border: 'none',
            padding: '5px 10px',
            cursor: 'pointer',
            borderRadius: '3px',
        },
        summary: {
            border: '1px solid #ddd',
            padding: '10px',
            borderRadius: '5px',
        },
        summaryHeader: {
            textAlign: 'center',
            marginBottom: '10px',
            fontWeight: 'bold',
            fontSize: '18px',
        },
        summaryText: {
            textAlign: 'center',
            margin: '5px 0',
        },
        billingInfo: {
            marginTop: '20px',
        },
        inputField: {
            width: '100%',
            padding: '10px',
            margin: '5px 0',
            borderRadius: '5px',
            border: '1px solid #ddd',
            fontSize: '16px',
        },
        checkoutButton: {
            backgroundColor: '#28a745',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            fontSize: '16px',
            cursor: 'pointer',
            marginTop: '20px',
            width: '100%',
        },
    };

    return (
        <div style={styles.checkoutPage}>
            <h1 style={styles.header}>Checkout</h1>
            <div style={styles.cartItems}>
                {cart.map((item) => (
                    <div key={item.id} style={styles.cartItem}>
                        <span style={styles.itemName}>{item.name}</span>
                        <span style={styles.itemPrice}>R{item.price.toFixed(2)}</span>
                        <span style={styles.quantityControl}>
                            <button
                                style={styles.quantityButton}
                                onClick={() => updateQuantity(item.id, -1)}
                            >
                                -
                            </button>
                            {item.quantity}
                            <button
                                style={styles.quantityButton}
                                onClick={() => updateQuantity(item.id, 1)}
                            >
                                +
                            </button>
                        </span>
                        <button
                            style={styles.removeButton}
                            onClick={() => removeFromCart(item.id)}
                        >
                            Remove
                        </button>
                    </div>
                ))}
            </div>

            <div style={styles.billingInfo}>
                <h2 style={styles.summaryHeader}>Billing Information</h2>
                <input type="text" placeholder="Name on Card" style={styles.inputField} />
                <input type="text" placeholder="Card Number" style={styles.inputField} />
                <input type="text" placeholder="Expiry Date (MM/YY)" style={styles.inputField} />
                <input type="text" placeholder="CVV" style={styles.inputField} />
                <h2 style={styles.summaryHeader}>Shipping Address</h2>
                <input type="text" placeholder="Address Line 1" style={styles.inputField} />
                <input type="text" placeholder="City" style={styles.inputField} />
                <input type="text" placeholder="Postal Code" style={styles.inputField} />
                <input type="text" placeholder="Country" style={styles.inputField} />
            </div>

         <button style={styles.checkoutButton} onClick={placeOrder}>
                Place Order (Fake Payment)
            </button>
        </div>
    );
};

export default CheckoutPage;
