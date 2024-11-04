// src/pages/OrderTracking.js

import React, { useEffect, useState } from 'react';
import { firestore, auth } from '../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';

const OrderTracking = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const user = auth.currentUser;
                if (!user) {
                    console.error("User not authenticated");
                    setLoading(false);
                    return;
                }

                // Get orders where the current user is the buyer
                const ordersRef = collection(firestore, "orders");
                const q = query(ordersRef, where("buyerId", "==", user.uid));
                const snapshot = await getDocs(q);
                const userOrders = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                
                setOrders(userOrders);
            } catch (error) {
                console.error("Error fetching orders:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
            <h1>Order Tracking</h1>
            {loading ? (
                <p>Loading your orders...</p>
            ) : (
                orders.length > 0 ? (
                    <table style={{ margin: '20px auto', width: '80%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th style={styles.tableHeader}>Order ID</th>
                                <th style={styles.tableHeader}>Products</th>
                                <th style={styles.tableHeader}>Quantity</th>
                                <th style={styles.tableHeader}>Status</th>
                                <th style={styles.tableHeader}>Total Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order.id} style={styles.tableRow}>
                                    <td style={styles.tableCell}>{order.id}</td>
                                    <td style={styles.tableCell}>
                                        {order.items.map((item, index) => (
                                            <div key={index}>
                                                <strong>{item.name}</strong>
                                                <br />
                                                <img src={item.imageUrl || 'https://via.placeholder.com/50'} alt={item.name} style={styles.productImage} />
                                            </div>
                                        ))}
                                    </td>
                                    <td style={styles.tableCell}>
                                        {order.items.map((item, index) => (
                                            <div key={index}>{item.quantity}</div>
                                        ))}
                                    </td>
                                    <td style={styles.tableCell}>{order.status}</td>
                                    <td style={styles.tableCell}>R{order.totalAmount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>You have no orders to display.</p>
                )
            )}
        </div>
    );
};

const styles = {
    tableHeader: {
        border: '1px solid #ddd',
        padding: '10px',
        fontWeight: 'bold',
        backgroundColor: '#f5f5f5',
    },
    tableCell: {
        border: '1px solid #ddd',
        padding: '10px',
        textAlign: 'center',
    },
    tableRow: {
        backgroundColor: '#fff',
    },
    productImage: {
        width: '50px',
        height: '50px',
        marginTop: '5px',
        borderRadius: '4px',
    },
};

export default OrderTracking;
