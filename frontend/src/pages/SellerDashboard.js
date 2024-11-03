import React, { useState } from "react";
import { firestore, storage, auth } from "../firebaseConfig";
import { addDoc, collection } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const SellerDashboard = () => {
    const [productName, setProductName] = useState("");
    const [price, setPrice] = useState("");
    const [stock, setStock] = useState("");
    const [category, setCategory] = useState("");
    const [image, setImage] = useState(null);
    const [description, setDescription] = useState("");
    const [error, setError] = useState("");

    const handleProductSubmit = async (e) => {
        e.preventDefault();
        const user = auth.currentUser;

        if (!user) {
            setError("User is not authenticated.");
            return;
        }

        try {
            const imageRef = ref(storage, `products/${user.uid}/${image.name}`);
            await uploadBytes(imageRef, image);
            const imageUrl = await getDownloadURL(imageRef);

            const productData = {
                sellerId: user.uid,
                name: productName,
                description,
                price: parseFloat(price),
                stock: parseInt(stock),
                imageUrl,
                category,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            await addDoc(collection(firestore, "products"), productData);
            setProductName("");
            setPrice("");
            setStock("");
            setCategory("");
            setImage(null);
            setDescription("");
            setError("");
            alert("Product added successfully.");
        } catch (error) {
            console.error("Error uploading product:", error);
            setError("There was an error uploading the product. Please try again.");
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.heading}>Seller Dashboard - Add Product</h2>
            <form onSubmit={handleProductSubmit} style={styles.form}>
                <input type="text" placeholder="Product Name" value={productName} onChange={(e) => setProductName(e.target.value)} required style={styles.input} />
                <input type="number" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} required style={styles.input} />
                <input type="number" placeholder="Stock" value={stock} onChange={(e) => setStock(e.target.value)} required style={styles.input} />
                <input type="text" placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} required style={styles.input} />
                <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required style={styles.textarea} />
                <input type="file" onChange={(e) => setImage(e.target.files[0])} required style={styles.fileInput} />
                {error && <p style={styles.error}>{error}</p>}
                <button type="submit" style={styles.button}>Add Product</button>
            </form>
        </div>
    );
};

const styles = {
    container: {
        padding: "40px",
        maxWidth: "600px",
        margin: "0 auto",
        textAlign: "center",
    },
    heading: {
        fontSize: "2rem",
        marginBottom: "20px",
        color: "#333",
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "15px",
        alignItems: "center",
    },
    input: {
        padding: "10px",
        fontSize: "16px",
        width: "100%",
        maxWidth: "400px",
        borderRadius: "8px",
        border: "1px solid #ddd",
        transition: "all 0.3s ease",
        boxShadow: "0px 4px 8px rgba(0,0,0,0.1)",
    },
    textarea: {
        padding: "10px",
        fontSize: "16px",
        width: "100%",
        maxWidth: "400px",
        height: "100px",
        borderRadius: "8px",
        border: "1px solid #ddd",
    },
    fileInput: {
        padding: "10px",
        fontSize: "16px",
        borderRadius: "8px",
        border: "1px solid #ddd",
    },
    button: {
        padding: "12px 20px",
        fontSize: "1rem",
        fontWeight: "bold",
        backgroundColor: "#28a745",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        transition: "background-color 0.3s ease",
    },
    error: {
        color: "red",
        fontSize: "0.9rem",
        marginTop: "10px",
    },
};

export default SellerDashboard;
