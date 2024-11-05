import React, { useContext, useEffect, useState } from 'react';
import { CartContext } from '../contexts/CartContext';
import { firestore, auth } from '../firebaseConfig';
import { doc, setDoc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { FaMapMarkerAlt, FaUser, FaCreditCard, FaExclamationCircle } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CheckoutPage = () => {
    const { cart: contextCart, removeFromCart, updateQuantity, clearCart } = useContext(CartContext);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [discountCode, setDiscountCode] = useState("");
    const [discountApplied, setDiscountApplied] = useState(false);
    const [location, setLocation] = useState("");
    const [bankDetails, setBankDetails] = useState({ accountNumber: "", accountHolder: "" });

    useEffect(() => {
        let unsubscribe;

        const loadUserCart = (user) => {
            if (user) {
                const cartRef = doc(firestore, "carts", user.uid);
                unsubscribe = onSnapshot(cartRef, (cartSnapshot) => {
                    if (cartSnapshot.exists()) {
                        setCart(cartSnapshot.data().items || []);
                    } else {
                        setCart([]);
                    }
                    setLoading(false);
                });
            } else {
                setCart([]);
                setLoading(false);
            }
        };

        const authUnsubscribe = onAuthStateChanged(auth, (user) => {
            setLoading(true);
            loadUserCart(user);
        });

        return () => {
            if (unsubscribe) unsubscribe();
            if (authUnsubscribe) authUnsubscribe();
        };
    }, []);


    const calculateSubtotal = () => {
        return cart.reduce((total, item) => {
            const price = item.discount > 0 ? item.price * (1 - item.discount / 100) : item.price;
            const quantity = item.quantity ?? 1;
            return total + price * quantity;
        }, 0).toFixed(2);
    };

    const calculateDiscount = () => {
        const itemDiscount = cart.reduce((total, item) => {
            const originalPrice = item.price ?? 0;
            const discountAmount = item.discount ? (originalPrice * item.discount / 100) * (item.quantity ?? 1) : 0;
            return total + discountAmount;
        }, 0);

        const codeDiscount = discountApplied ? calculateSubtotal() * 0.1 : 0;
        return (itemDiscount + codeDiscount).toFixed(2);
    };

    const subtotal = calculateSubtotal();
    const discountTotal = calculateDiscount();
    const estimatedTax = (subtotal * 0.15).toFixed(2); // 15% tax rate
    const total = (subtotal - discountTotal + parseFloat(estimatedTax)).toFixed(2);

     const applyDiscount = () => {
        if (discountCode === "SAVE10") {
            setDiscountApplied(true);
            toast.success("Discount applied!");
        } else {
            toast.error("Invalid discount code");
        }
    };


    
   const placeOrder = async () => {
    const user = auth.currentUser;
    if (!user || cart.length === 0) {
        toast.warn("Please add items to the cart before placing an order.");
        return;
    }

    try {
        toast.info("Processing payment...");

        // Simulate a delay for the fake payment process
        await new Promise(resolve => setTimeout(resolve, 2000));

        const orderData = {
            buyerId: user.uid,
            items: cart.map((item) => ({
                id: item.id,
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                sellerId: item.sellerId, // Ensure sellerId is included in each order item
                imageUrl: item.imageUrl,
                discountedPrice: item.discount > 0 ? item.price * (1 - item.discount / 100) : item.price,
            })),
            totalAmount: total,
            location: location, // Add location field
            bankDetails: bankDetails,
            status: "Order Confirmed", // Initial status for order tracking
            createdAt: new Date(),
        };

        // Store order in Firestore
        await setDoc(doc(firestore, "orders", `${user.uid}_${Date.now()}`), orderData);

        // Simulate updating stock and sold count in products
        for (const item of cart) {
            const productRef = doc(firestore, "products", item.id);
            const productSnapshot = await getDoc(productRef);

            if (productSnapshot.exists()) {
                const productData = productSnapshot.data();
                const newStock = (productData.stock || 0) - item.quantity;
                const newSoldCount = (productData.soldCount || 0) + item.quantity;

                if (newStock >= 0) {
                    await updateDoc(productRef, {
                        stock: newStock,
                        soldCount: newSoldCount,
                    });
                } else {
                    toast.error(`Insufficient stock for ${item.name}. Please adjust your quantity.`);
                    return;
                }
            } else {
                console.error(`Product ${item.id} not found`);
            }
        }

        clearCart();
        toast.success("Order placed! You can track it in your order history.");
    } catch (error) {
        console.error("Error placing order:", error);
        toast.error("Failed to place order. Please try again.");
    }
};



    const styles = {
        checkoutPage: {
            display: 'flex',
            maxWidth: '1200px',
            margin: '0 auto',
            marginTop: '50px',
            padding: '20px',
            fontFamily: 'Arial, sans-serif',
        },
        cartItemsContainer: {
            flex: 3,
            marginRight: '20px',
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        },
        cartItem: {
            display: 'flex',
            alignItems: 'center',
            padding: '15px 0',
            borderBottom: '1px solid #ddd',
            position: 'relative',
        },
        discountLabel: {
            position: 'absolute',
            top: '10px',
            left: '10px',
            backgroundColor: '#ff4c4c',
            color: '#fff',
            padding: '4px 8px',
            fontWeight: 'bold',
            fontSize: '12px',
            borderRadius: '4px',
        },
        productImage: {
            width: '80px',
            height: '80px',
            marginRight: '15px',
            borderRadius: '8px',
            objectFit: 'cover',
        },
        itemName: {
            flex: 2,
            fontWeight: 'bold',
            color: '#007bff',
        },
        itemPrice: {
            flex: 1,
            textAlign: 'center',
            fontWeight: '600',
        },
        quantityControl: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
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
            color: 'red',
            cursor: 'pointer',
            marginLeft: '10px',
            fontSize: '20px',
            fontWeight: 'bold',
        },
          summaryContainer: {
            flex: 1,
            padding: '20px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            backgroundColor: '#f9f9f9',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        },
        summaryHeader: {
            fontWeight: 'bold',
            marginBottom: '10px',
            fontSize: '1.5rem',
            color: '#333',
        },
        summaryItem: {
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '8px',
            fontSize: '1.1rem',
            color: '#555',
        },
        discountCodeContainer: {
            display: 'flex',
            marginTop: '15px',
        },
        discountInput: {
            flex: 1,
            padding: '8px',
            borderRadius: '4px 0 0 4px',
            border: '1px solid #ddd',
            fontSize: '1rem',
        },
        applyButton: {
            padding: '8px 15px',
            backgroundColor: '#ff9f00',
            border: 'none',
            borderRadius: '0 4px 4px 0',
            color: 'white',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '600',
        },
        sectionContainer: {
            marginTop: '20px',
            padding: '20px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            backgroundColor: '#fff',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        },
        sectionHeader: {
            display: 'flex',
            alignItems: 'center',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            color: '#333',
            marginBottom: '15px',
        },
         sectionIcon: {
            marginRight: '10px',
            color: '#007bff',
        },
        inputContainer: {
            display: 'flex',
            flexDirection: 'column',
            marginBottom: '15px',
        },
        inputLabel: {
            fontSize: '0.9rem',
            color: '#555',
            marginBottom: '5px',
            fontWeight: '500',
        },
        inputField: {
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '5px',
            fontSize: '1rem',
            backgroundColor: '#f8f8f8',
            boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.1)',
            transition: 'border-color 0.3s ease',
        },
        inputFieldFocus: {
            borderColor: '#007bff',
            outline: 'none',
        },
        disclaimer: {
            fontSize: '0.8rem',
            color: '#777',
            marginTop: '15px',
            display: 'flex',
            alignItems: 'center',
        },
        disclaimerIcon: {
            marginRight: '5px',
            color: '#ff4c4c',
        },
        checkoutButton: {
            padding: '15px',
            backgroundColor: '#ff9f00',
            border: 'none',
            borderRadius: '5px',
            color: 'white',
            fontSize: '1.2rem',
            cursor: 'pointer',
            fontWeight: '600',
            marginTop: '15px',
            width: '100%',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
            transition: 'background-color 0.3s ease',
        },
    };

    return (
        loading ? <p>Loading...</p> : (
            <div style={styles.checkoutPage}>
                 <ToastContainer />
                <div style={styles.cartItemsContainer}>
                    {cart.length > 0 ? (
                        cart.map((item, index) => (
                             <div key={`${item.id}-${index}`} style={styles.cartItem}>
                                {item.discount > 0 && (
                                    <div style={styles.discountLabel}>{item.discount}% OFF</div>
                                )}
                                <img src={item.imageUrl || 'https://via.placeholder.com/80'} alt={item.name} style={styles.productImage} />
                                <span style={styles.itemName}>{item.name}</span>
                                <span style={styles.itemPrice}>R{((item.discount > 0 ? item.price * (1 - item.discount / 100) : item.price)).toFixed(2)}</span>
                                <div style={styles.quantityControl}>
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
                                </div>
                                <span style={styles.itemPrice}>R{((item.discount > 0 ? item.price * (1 - item.discount / 100) : item.price) * item.quantity).toFixed(2)}</span>
                                <button
                                    style={styles.removeButton}
                                    onClick={() => removeFromCart(item.id)}
                                >
                                    ✕
                                </button>
                            </div>
                        ))
                    ) : (
                        <p>No items in cart.</p>
                    )}
                    <div style={styles.discountCodeContainer}>
                        <input 
                            type="text" 
                            placeholder="Discount code" 
                            style={styles.discountInput} 
                            value={discountCode}
                            onChange={(e) => setDiscountCode(e.target.value)}
                        />
                        <button style={styles.applyButton} onClick={applyDiscount}>Apply</button>
                    </div>
                </div>
                <div style={styles.summaryContainer}>
                    <h2 style={styles.summaryHeader}>Cart Total</h2>
                    <div style={styles.summaryItem}>
                        <span>Subtotal</span>
                        <span>R{subtotal}</span>
                    </div>
                    <div style={styles.summaryItem}>
                        <span>Discount</span>
                        <span>R{discountTotal}</span>
                    </div>
                    <div style={styles.summaryItem}>
                        <span>Estimated Tax</span>
                        <span>R{estimatedTax}</span>
                    </div>
                    <div style={styles.summaryItem}>
                        <span>Total</span>
                        <span style={styles.totalPriceContainer}>R{total}</span>
                    </div>
                   
                    <div style={styles.sectionContainer}>
                        <div style={styles.sectionHeader}>
                            <FaMapMarkerAlt style={styles.sectionIcon} />
                            Delivery Location
                        </div>
                        <div style={styles.inputContainer}>
                            <label style={styles.inputLabel} htmlFor="location">Location</label>
                            <input
                                type="text"
                                id="location"
                                placeholder="Enter your location"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                style={styles.inputField}
                                onFocus={(e) => e.target.style.borderColor = '#007bff'}
                                onBlur={(e) => e.target.style.borderColor = '#ddd'}
                            />
                        </div>
                    </div>
                    <div style={styles.sectionContainer}>
                        <div style={styles.sectionHeader}>
                            <FaCreditCard style={styles.sectionIcon} />
                            Billing Information
                        </div>
                        <div style={styles.inputContainer}>
                            <label style={styles.inputLabel} htmlFor="accountHolder">Account Holder Name</label>
                            <input
                                type="text"
                                id="accountHolder"
                                placeholder="Account Holder Name"
                                value={bankDetails.accountHolder}
                                onChange={(e) => setBankDetails({ ...bankDetails, accountHolder: e.target.value })}
                                style={styles.inputField}
                                onFocus={(e) => e.target.style.borderColor = '#007bff'}
                                onBlur={(e) => e.target.style.borderColor = '#ddd'}
                            />
                        </div>
                        <div style={styles.inputContainer}>
                            <label style={styles.inputLabel} htmlFor="accountNumber">Account Number</label>
                            <input
                                type="text"
                                id="accountNumber"
                                placeholder="Account Number"
                                value={bankDetails.accountNumber}
                                onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                                style={styles.inputField}
                                onFocus={(e) => e.target.style.borderColor = '#007bff'}
                                onBlur={(e) => e.target.style.borderColor = '#ddd'}
                            />
                        </div>
                    </div>
                    <div style={styles.disclaimer}>
                        <FaExclamationCircle style={styles.disclaimerIcon} />
                        This payment process is a demonstration and does not involve real transactions.
                    </div>
                    <button style={styles.checkoutButton} onClick={placeOrder}>
                        Checkout
                    </button>
                </div>
            </div>
        )
    );
};

export default CheckoutPage;


