import React, { useContext, useEffect, useState } from 'react';
import { CartContext } from '../contexts/CartContext';
import { firestore, auth } from '../firebaseConfig';
import { collection, doc, updateDoc, addDoc, getDoc, setDoc } from 'firebase/firestore';

const CheckoutPage = () => {
    const { cart: contextCart, removeFromCart, updateQuantity, clearCart } = useContext(CartContext);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUserCart = async () => {
            const user = auth.currentUser;
            if (user) {
                const cartRef = doc(firestore, "carts", user.uid);
                const cartSnapshot = await getDoc(cartRef);

                if (cartSnapshot.exists()) {
                    setCart(cartSnapshot.data().items || []);
                } else {
                    setCart(contextCart);
                }
            } else {
                setCart(contextCart);
            }
            setLoading(false);
        };

        loadUserCart();
    }, [contextCart]);

    useEffect(() => {
        const saveCartToFirestore = async (updatedCart) => {
            const user = auth.currentUser;
            if (user) {
                const cartRef = doc(firestore, "carts", user.uid);
                await setDoc(cartRef, { items: updatedCart }, { merge: true });
            }
        };

        saveCartToFirestore(cart);
    }, [cart]);

    const calculateTotal = () => {
        return cart.reduce((total, item) => {
            const price = item.price ?? 0;
            const quantity = item.quantity ?? 1;
            return total + price * quantity;
        }, 0).toFixed(2);
    };

    const calculateDiscount = () => {
        return cart.reduce((total, item) => {
            const price = item.price ?? 0;
            const discountPercentage = item.discountPercentage ?? 0;
            const discountAmount = (price * discountPercentage) / 100;
            const quantity = item.quantity ?? 1;
            return total + discountAmount * quantity;
        }, 0).toFixed(2);
    };

    const total = calculateTotal();
    const totalDiscount = calculateDiscount();
    const finalTotal = (total - totalDiscount).toFixed(2);

    const placeOrder = async () => {
        const user = auth.currentUser;
        if (!user || cart.length === 0) return;

        const orderData = {
            buyerId: user.uid,
            items: cart.map((item) => ({
                id: item.id,
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                sellerId: item.sellerId,
            })),
            totalAmount: finalTotal,
            isApprovedBySeller: false,
            createdAt: new Date(),
        };
        await addDoc(collection(firestore, "orders"), orderData);

        for (const item of cart) {
            const productRef = doc(firestore, 'products', item.id);
            await updateDoc(productRef, { stock: item.stock - item.quantity });
        }

        alert("Order placed! Awaiting seller approval.");
        clearCart();
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
        loading ? <p>Loading...</p> : (
            <div style={styles.checkoutPage}>
                <h1 style={styles.header}>Checkout</h1>
                <div style={styles.cartItems}>
                    {cart.map((item) => (
                        <div key={item.id} style={styles.cartItem}>
                            <span style={styles.itemName}>{item.name}</span>
                            <span style={styles.itemPrice}>R{(item.price ?? 0).toFixed(2)}</span>
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
        )
    );
};

export default CheckoutPage;
