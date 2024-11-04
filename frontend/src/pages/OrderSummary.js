import React, { useEffect, useState } from 'react';
import { firestore, auth } from '../firebaseConfig';
import { collection, onSnapshot, where, query } from 'firebase/firestore';

const OrderSummary = () => {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const user = auth.currentUser;
        if (user) {
            const ordersQuery = query(collection(firestore, "orders"), where("buyerId", "==", user.uid));
            const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
                setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            });
            return unsubscribe;
        }
    }, []);

    return (
        <div>
            <h3>Order Summary</h3>
            {orders.map(order => (
                <div key={order.id} style={{ borderBottom: '1px solid #ddd', marginBottom: '10px', paddingBottom: '10px' }}>
                    <h4>Order ID: {order.id}</h4>
                    {order.items.map((item, index) => (
                        <p key={index}>{item.name} - Quantity: {item.quantity}</p>
                    ))}
                    <p>Status: {order.status}</p>
                </div>
            ))}
        </div>
    );
};

export default OrderSummary;
