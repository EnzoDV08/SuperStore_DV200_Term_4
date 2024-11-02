import React from 'react';

const OrderManagement = ({ orders, onUpdateStatus }) => {
    const handleStatusUpdate = (orderId, newStatus) => {
        onUpdateStatus(orderId, newStatus);
    };

    return (
        <div>
            <h3>Order Management</h3>
            <table>
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map(order => (
                        <tr key={order.id}>
                            <td>{order.id}</td>
                            <td>{order.items.map(item => item.name).join(", ")}</td>
                            <td>{order.items.map(item => item.quantity).join(", ")}</td>
                            <td>{order.status}</td>
                            <td>
                                <button onClick={() => handleStatusUpdate(order.id, "Accepted")}>Accept</button>
                                <button onClick={() => handleStatusUpdate(order.id, "In Progress")}>In Progress</button>
                                <button onClick={() => handleStatusUpdate(order.id, "Completed")}>Completed</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default OrderManagement;

