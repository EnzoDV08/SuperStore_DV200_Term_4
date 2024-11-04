import React, { useState, useEffect } from "react";
import { firestore, storage, auth } from "../firebaseConfig";
import { collection, doc, setDoc, getDocs, updateDoc, deleteDoc, query, where } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { onAuthStateChanged } from "firebase/auth";
import { faPlus, faSearch, faTrash } from "@fortawesome/free-solid-svg-icons";
import OrderManagement from "../components/OrderManagement";
import { useNavigate } from "react-router-dom";

const SellerDashboard = () => {
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showAddProductModal, setShowAddProductModal] = useState(false);
    const [newProduct, setNewProduct] = useState({
        name: "",
        category: "",
        price: "",
        stock: "",
        image: null,
        description: ""
    });
    const [totalSales, setTotalSales] = useState(0);
    const [totalProducts, setTotalProducts] = useState(0);
    const [orders, setOrders] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                fetchProducts(user);
                fetchOrders(user);
            } else {
                console.error("No authenticated user found");
            }
        });

        return () => unsubscribe();
    }, []);

    const fetchProducts = async (user) => {
        try {
            const productsRef = collection(firestore, "products");
            const snapshot = await getDocs(productsRef);
            const userProducts = snapshot.docs
                .filter(doc => doc.data().sellerId === user.uid)
                .map(doc => ({ id: doc.id, ...doc.data() }));
            
            let sales = 0;
            let productCount = userProducts.length;
            userProducts.forEach(product => {
                sales += (product.price || 0) * (product.sold || 0);
            });

            setProducts(userProducts);
            setTotalSales(sales);
            setTotalProducts(productCount);
        } catch (error) {
            console.error("Error fetching products:", error.message);
        }
    };

    const fetchOrders = async (user) => {
        try {
            const ordersRef = collection(firestore, "orders");
            const ordersQuery = query(ordersRef, where("sellerId", "==", user.uid));
            const snapshot = await getDocs(ordersQuery);
            const userOrders = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            setOrders(userOrders);
        } catch (error) {
            console.error("Error fetching orders:", error.message);
        }
    };

    const handleAddProduct = async () => {
        const user = auth.currentUser;
        if (!user || !newProduct.image) return;

        try {
            const imageRef = ref(storage, `products/${user.uid}/${newProduct.image.name}`);
            await uploadBytes(imageRef, newProduct.image);
            const imageUrl = await getDownloadURL(imageRef);

            const SKU = `SKU-${Date.now()}`;

            const productData = {
                name: newProduct.name,
                category: newProduct.category,
                price: parseFloat(newProduct.price) || 0,
                stock: parseInt(newProduct.stock) || 0,
                imageUrl,
                description: newProduct.description,
                discount: 0,
                sold: 0,
                SKU,
                sellerId: user.uid,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const productRef = doc(collection(firestore, "products"));
            await setDoc(productRef, productData);

            setProducts([...products, { id: productRef.id, ...productData }]);
            setTotalProducts(totalProducts + 1);
            setShowAddProductModal(false);
            setNewProduct({
                name: "",
                category: "",
                price: "",
                stock: "",
                image: null,
                description: ""
            });
        } catch (error) {
            console.error("Error adding product:", error);
        }
    };

    const handleUpdateProduct = async (productId, field, value) => {
        try {
            const productRef = doc(firestore, "products", productId);
            await updateDoc(productRef, { [field]: value, updatedAt: new Date() });
            setProducts(products.map(product =>
                product.id === productId ? { ...product, [field]: value } : product
            ));

            if (field === "price" || field === "sold") {
                recalculateTotalSales();
            }
        } catch (error) {
            console.error("Error updating product:", error);
        }
    };

    const handleDeleteProduct = async (productId) => {
        try {
            await deleteDoc(doc(firestore, "products", productId));
            setProducts(products.filter(product => product.id !== productId));
            setTotalProducts(totalProducts - 1);
            recalculateTotalSales();
        } catch (error) {
            console.error("Error deleting product:", error);
        }
    };

    const recalculateTotalSales = () => {
        let updatedSales = 0;
        products.forEach(product => {
            updatedSales += (product.price || 0) * (product.sold || 0);
        });
        setTotalSales(updatedSales);
    };

    const handleOrderStatusUpdate = async (orderId, status) => {
        try {
            const orderRef = doc(firestore, "orders", orderId);
            await updateDoc(orderRef, { status, updatedAt: new Date() });
            setOrders(orders.map(order =>
                order.id === orderId ? { ...order, status } : order
            ));
        } catch (error) {
            console.error("Error updating order status:", error);
        }
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={styles.container}>
            <button style={styles.backButton} onClick={() => navigate("/account-details")}>
                Back to Account Details
            </button>
            <div style={styles.header}>
                <h2 style={styles.heading}>Seller Dashboard</h2>
                <div style={styles.summary}>
                    <p>Total Products: {totalProducts}</p>
                    <p>Total Sales: R{totalSales.toFixed(2)}</p>
                </div>
                <div style={styles.searchContainer}>
                    <FontAwesomeIcon icon={faSearch} style={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={styles.searchInput}
                    />
                </div>
                <button style={styles.addButton} onClick={() => setShowAddProductModal(true)}>
                    <FontAwesomeIcon icon={faPlus} /> New Product
                </button>
            </div>

            <table style={styles.table}>
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Category</th>
                        <th>Stock</th>
                        <th>Price</th>
                        <th>Discount</th>
                        <th>Sold</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredProducts.map(product => (
                        <tr key={product.id} style={styles.tableRow}>
                            <td style={styles.productInfo}>
                                <img src={product.imageUrl} alt={product.name} style={styles.productImage} />
                                <span>{product.name}</span>
                            </td>
                            <td>{product.category}</td>
                            <td style={product.stock < 10 ? { color: "red" } : null}>
                                <input
                                    type="number"
                                    value={product.stock}
                                    onChange={(e) => handleUpdateProduct(product.id, "stock", parseInt(e.target.value))}
                                    style={styles.inputField}
                                />
                            </td>
                            <td>
                                <input
                                    type="number"
                                    value={product.price.toFixed(2)}
                                    onChange={(e) => handleUpdateProduct(product.id, "price", parseFloat(e.target.value))}
                                    style={styles.inputField}
                                />
                            </td>
                            <td>
                                <select
                                    value={product.discount}
                                    onChange={(e) => handleUpdateProduct(product.id, "discount", parseFloat(e.target.value))}
                                    style={styles.discountSelect}
                                >
                                    {[0, 5, 10, 15, 20, 25].map(discount => (
                                        <option key={discount} value={discount}>{discount}%</option>
                                    ))}
                                </select>
                            </td>
                            <td>{product.sold || 0}</td>
                            <td style={product.stock > 0 ? styles.activeStatus : styles.outOfStock}>
                                {product.stock > 0 ? "Active" : "Out of Stock"}
                            </td>
                            <td>
                                <button style={styles.actionButton} onClick={() => handleDeleteProduct(product.id)}>
                                    <FontAwesomeIcon icon={faTrash} /> Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <OrderManagement orders={orders} onUpdateStatus={handleOrderStatusUpdate} />

            {showAddProductModal && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <h3>Add New Product</h3>
                        <input
                            type="text"
                            placeholder="Product Name"
                            value={newProduct.name}
                            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                            style={styles.input}
                        />
                        <input
                            type="text"
                            placeholder="Category"
                            value={newProduct.category}
                            onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                            style={styles.input}
                        />
                        <input
                            type="number"
                            placeholder="Price"
                            value={newProduct.price}
                            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                            style={styles.input}
                        />
                        <input
                            type="number"
                            placeholder="Stock"
                            value={newProduct.stock}
                            onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                            style={styles.input}
                        />
                        <input
                            type="file"
                            onChange={(e) => setNewProduct({ ...newProduct, image: e.target.files[0] })}
                            style={styles.fileInput}
                        />
                        <textarea
                            placeholder="Product Description"
                            value={newProduct.description}
                            onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                            style={styles.textarea}
                        />
                        <button onClick={handleAddProduct} style={styles.modalAddButton}>Add Product</button>
                        <button onClick={() => setShowAddProductModal(false)} style={styles.modalCloseButton}>Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
};

    const styles = {
    container: { padding: "20px", maxWidth: "1200px", margin: "0 auto", marginTop: "100px" },
    header: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" },
    heading: { fontSize: "2rem", color: "#333" },
    summary: { 
        fontSize: "1.1rem", 
        color: "#555", 
        display: "flex", 
        gap: "30px", 
        fontWeight: "bold",
        alignItems: "center",
        backgroundColor: "#f8f9fa",
        padding: "10px 20px",
        borderRadius: "8px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)"
    },
    searchContainer: { display: "flex", alignItems: "center", position: "relative" },
    searchIcon: { position: "absolute", left: "10px", color: "#999" },
    searchInput: { padding: "10px 10px 10px 35px", borderRadius: "8px", border: "1px solid #ddd", width: "250px" },
    addButton: { 
        backgroundColor: "#007bff", 
        color: "#fff", 
        padding: "10px 20px", 
        borderRadius: "8px", 
        border: "none", 
        cursor: "pointer", 
        fontSize: "1rem", 
        fontWeight: "bold", 
        transition: "background-color 0.3s ease",
        display: "flex", 
        alignItems: "center", 
        gap: "5px"
    },
    table: { 
        width: "100%", 
        borderCollapse: "collapse", 
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)", 
        borderRadius: "10px", 
        overflow: "hidden", 
        backgroundColor: "#fff",
        marginTop: "20px"
    },
    tableRow: { 
        borderBottom: "1px solid #eee", 
        transition: "background-color 0.2s ease-in-out" 
    },
    tableRowHover: { backgroundColor: "#f9f9f9" },
    productInfo: { 
        display: "flex", 
        alignItems: "center", 
        padding: "15px", 
        gap: "10px", 
        fontSize: "1rem", 
        fontWeight: "500" 
    },
    productImage: { 
        width: "50px", 
        height: "50px", 
        borderRadius: "4px", 
        objectFit: "cover", 
        border: "1px solid #ddd" 
    },
    inputField: { 
        width: "70px", 
        padding: "6px", 
        borderRadius: "4px", 
        border: "1px solid #ddd", 
        textAlign: "center", 
        fontSize: "0.95rem", 
        color: "#333" 
    },
    discountSelect: { 
        width: "80px", 
        padding: "6px", 
        borderRadius: "4px", 
        border: "1px solid #ddd", 
        fontSize: "0.95rem", 
        color: "#333" 
    },
    actionButton: { 
        padding: "6px 12px", 
        backgroundColor: "#007bff", 
        color: "#fff", 
        border: "none", 
        borderRadius: "5px", 
        cursor: "pointer", 
        fontSize: "0.9rem", 
        fontWeight: "bold",
        transition: "background-color 0.3s ease",
        textAlign: "center"
    },
    activeStatus: { color: "#28a745", fontWeight: "bold" },
    outOfStock: { color: "#dc3545", fontWeight: "bold" },
    modalOverlay: { 
        position: "fixed", 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        backgroundColor: "rgba(0, 0, 0, 0.6)", 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center" 
    },
    modalContent: { 
        backgroundColor: "#fff", 
        padding: "30px", 
        borderRadius: "10px", 
        width: "500px", 
        display: "flex", 
        flexDirection: "column", 
        animation: "fadeIn 0.5s ease-in-out" 
    },
    modalAddButton: { 
        marginTop: "10px", 
        padding: "10px", 
        backgroundColor: "#28a745", 
        color: "#fff", 
        border: "none", 
        borderRadius: "8px", 
        cursor: "pointer", 
        fontSize: "1rem", 
        fontWeight: "bold" 
    },
    modalCloseButton: { 
        marginTop: "10px", 
        padding: "10px", 
        backgroundColor: "#dc3545", 
        color: "#fff", 
        border: "none", 
        borderRadius: "8px", 
        cursor: "pointer", 
        fontSize: "1rem", 
        fontWeight: "bold" 
    },
    input: { 
        padding: "10px", 
        borderRadius: "6px", 
        border: "1px solid #ddd", 
        marginBottom: "10px", 
        fontSize: "1rem", 
        color: "#333" 
    },
    textarea: { 
        padding: "10px", 
        borderRadius: "6px", 
        border: "1px solid #ddd", 
        height: "80px", 
        resize: "vertical", 
        fontSize: "1rem", 
        color: "#333" 
    },
    fileInput: { 
        padding: "10px", 
        borderRadius: "6px", 
        border: "1px solid #ddd", 
        marginBottom: "10px", 
        fontSize: "1rem", 
        color: "#333" 
    },
     backButton: { 
        backgroundColor: "#007bff", 
        color: "#fff", 
        padding: "8px 15px", 
        borderRadius: "8px", 
        border: "none", 
        cursor: "pointer", 
        fontSize: "1rem", 
        fontWeight: "bold", 
        marginBottom: "20px" 
    },
};

export default SellerDashboard;


