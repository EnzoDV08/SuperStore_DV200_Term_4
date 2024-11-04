import { useEffect, useState } from 'react';
import { collection, getDocs } from "firebase/firestore";
import { auth, firestore } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

const OrderManagement = ({ onUpdateStatus }) => {
    const [orders, setOrders] = useState([]);
    
useEffect(() => {
    const fetchOrders = async (user) => {
        if (!user) return;

        try {
            const ordersRef = collection(firestore, "orders");
            const querySnapshot = await getDocs(ordersRef);

            const allOrders = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            // Filter orders where at least one item has sellerId matching the current user
            const userOrders = allOrders.filter(order => 
                order.items.some(item => item.sellerId === user.uid)
            );
            
            setOrders(userOrders);
        } catch (error) {
            console.error("Error fetching orders:", error.message);
        }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
            fetchOrders(user);
        }
    });

    return () => unsubscribe();
}, []);

    const handleStatusUpdate = (orderId, newStatus) => {
        onUpdateStatus(orderId, newStatus);
    };


     const styles = {
        container: {
            padding: '20px',
            maxWidth: '1200px',
            margin: '0 auto',
            marginTop: '80px',
            fontFamily: 'Arial, sans-serif',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        },
        heading: {
            fontSize: '1.8rem',
            color: '#333',
            marginBottom: '20px',
            textAlign: 'center',
        },
        table: {
            width: '100%',
            borderCollapse: 'collapse',
            marginTop: '20px',
        },
        th: {
            padding: '15px',
            backgroundColor: '#007bff',
            color: '#fff',
            fontWeight: 'bold',
            border: '1px solid #ddd',
        },
        td: {
            padding: '15px',
            border: '1px solid #ddd',
            textAlign: 'center',
            verticalAlign: 'middle',
        },
        image: {
            width: '60px',
            height: '60px',
            borderRadius: '8px',
            objectFit: 'cover',
        },
        button: {
            padding: '5px 10px',
            margin: '0 5px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            color: '#fff',
        },
        acceptButton: {
            backgroundColor: '#28a745',
        },
        progressButton: {
            backgroundColor: '#ffc107',
        },
        completedButton: {
            backgroundColor: '#17a2b8',
        },
    };

      return (
        <div style={styles.container}>
            <h3 style={styles.heading}>Order Management</h3>
            <table style={styles.table}>
                <thead>
                    <tr>
                        <th style={styles.th}>Order ID</th>
                        <th style={styles.th}>Product</th>
                        <th style={styles.th}>Quantity</th>
                        <th style={styles.th}>Status</th>
                        <th style={styles.th}>Location</th>
                        <th style={styles.th}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.length > 0 ? orders.map(order => (
                        <tr key={order.id}>
                            <td style={styles.td}>{order.id}</td>
                            <td style={styles.td}>
                                {order.items?.map((item, index) => (
                                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                        <img src={item.imageUrl || 'https://via.placeholder.com/60'} alt={item.name} style={styles.image} />
                                        <span>{item.name}</span>
                                    </div>
                                ))}
                            </td>
                            <td style={styles.td}>{order.items?.map(item => item.quantity).join(", ")}</td>
                            <td style={styles.td}>{order.status}</td>
                            <td style={styles.td}>
                                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.location)}`} target="_blank" rel="noopener noreferrer">
                                    View on Map
                                </a>
                            </td>
                            <td style={styles.td}>
                                <button onClick={() => handleStatusUpdate(order.id, "Accepted")} style={{ ...styles.button, ...styles.acceptButton }}>Accept</button>
                                <button onClick={() => handleStatusUpdate(order.id, "In Progress")} style={{ ...styles.button, ...styles.progressButton }}>In Progress</button>
                                <button onClick={() => handleStatusUpdate(order.id, "Completed")} style={{ ...styles.button, ...styles.completedButton }}>Completed</button>
                            </td>
                        </tr>
                    )) : <tr><td colSpan="6" style={styles.td}>No orders found.</td></tr>}
                </tbody>
            </table>
        </div>
    );
};

export default OrderManagement;
