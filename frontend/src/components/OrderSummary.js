import React from 'react';

const OrderSummary = ({ order }) => {
    const { items, status } = order;

    return (
        <div>
            <h3>Order Summary</h3>
            {items.map((item, index) => (
                <p key={index}>{item.name} - Quantity: {item.quantity}</p>
            ))}
            <p>Status: {status}</p>
        </div>
    );
};

export default OrderSummary;
