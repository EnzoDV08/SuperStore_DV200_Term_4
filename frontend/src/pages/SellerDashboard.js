import React, { useState, useEffect } from "react";
import { firestore, storage, auth } from "../firebaseConfig";
import { collection, doc, setDoc, getDocs, updateDoc, deleteDoc, query, where } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { onAuthStateChanged } from "firebase/auth";
import { faPlus, faSearch, faTrash, faUpload } from "@fortawesome/free-solid-svg-icons";
import OrderManagement from "../components/OrderManagement";
import { useNavigate } from "react-router-dom";

const SellerDashboard = () => {
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showAddProductModal, setShowAddProductModal] = useState(false);
    const [showClothingFields, setShowClothingFields] = useState(false);
    const [showElectronicsFields, setShowElectronicsFields] = useState(false);
    const [showBeautyFields, setShowBeautyFields] = useState(false);
    const [colors, setColors] = useState([]); // holds color values as an array
    const [currentColor, setCurrentColor] = useState(""); // holds the current color input
    const [newProduct, setNewProduct] = useState({
        
        name: "",
        category: "",
        price: "",
        stock: "",
        image: null,
        description: "",
        colors: "",
        sizes: "",
        gender: "",
        warranty: "",
        ingredients: "",
        discount: ""
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [totalSales, setTotalSales] = useState(0);
    const [totalProducts, setTotalProducts] = useState(0);
    const [selectedSizes, setSelectedSizes] = useState([]); // used for size selection
    const [selectedGender, setSelectedGender] = useState("");
    const [orders, setOrders] = useState([]);
    
    const categories = [
        "Clothing", 
        "Electronics", 
        "Home Goods", 
        "Beauty", 
        "Sports", 
        "Automotive"
    ];

    
    const navigate = useNavigate();

   useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                fetchProducts(user);
                fetchOrders(user);
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
                sales += ((product.price || 0) * (1 - (product.discount || 0) / 100)) * (product.soldCount || 0);
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

   const handleSizeToggle = (size) => {
        setSelectedSizes((prevSizes) =>
            prevSizes.includes(size) ? prevSizes.filter((s) => s !== size) : [...prevSizes, size]
        );
    };

    const handleGenderSelect = (gender) => {
        setSelectedGender(gender);
    };

    const handleAddProduct = async () => {
    const user = auth.currentUser;
    if (!user || !newProduct.image) return;

    try {
        // Upload the image and get the download URL
        const imageRef = ref(storage, `products/${user.uid}/${newProduct.image.name}`);
        await uploadBytes(imageRef, newProduct.image);
        const imageUrl = await getDownloadURL(imageRef);

        // Prepare the SKU and current timestamp for createdAt and updatedAt
        const SKU = `SKU-${Date.now()}`;
        const timestamp = new Date();

        // Define product data with all required fields for Firestore
        const productData = {
            SKU,
            category: newProduct.category || "Uncategorized",
            createdAt: timestamp,
            description: newProduct.description || "No description provided",
            discount: parseFloat(newProduct.discount) || 0, // Ensure numeric value
            imageUrl,
            name: newProduct.name || "Unnamed Product",
            price: parseFloat(newProduct.price) || 0, // Ensure numeric value
            sellerId: user.uid,
            soldCount: 0, // Initially set to 0 when the product is created
            stock: parseInt(newProduct.stock) || 0, // Ensure numeric value
            updatedAt: timestamp,
            colors: colors.length ? colors : [], // Save as an array in Firestore
            sizes: selectedSizes.join(", "),   // Comma-separated string of selected sizes
            gender: selectedGender,           // Gender
            warranty: newProduct.warranty || "",
            ingredients: newProduct.ingredients || "",
        };

        // Add product to Firestore
        const productRef = doc(collection(firestore, "products"));
        await setDoc(productRef, productData);

        // Update the local state to reflect the new product
        setProducts([...products, { id: productRef.id, ...productData }]);
        setTotalProducts(totalProducts + 1);
        setShowAddProductModal(false);

        // Reset form fields
        setNewProduct({
            name: "",
            category: "",
            price: "",
            stock: "",
            image: null,
            description: "",
            colors: "",
            sizes: "",
            gender: "",
            warranty: "",
            ingredients: ""
        });
        setSelectedSizes([]);
        setSelectedGender("");
        setColors([]);
        setImagePreview(null);
    } catch (error) {
        console.error("Error adding product:", error);
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

      const calculateTotalSales = (productsList) => {
        const totalSales = productsList.reduce((acc, product) => {
            const discountedPrice = product.price * (1 - (product.discount || 0) / 100);
            return acc + discountedPrice * (product.soldCount || 0);
        }, 0);
        setTotalSales(totalSales);
    };

 const handleUpdateProduct = async (productId, field, value) => {
    try {
        const productRef = doc(firestore, "products", productId);

        // Update the product field in Firestore
        await updateDoc(productRef, { [field]: value, updatedAt: new Date() });

        // Update the product in the local state
        const updatedProducts = products.map((product) => {
            if (product.id === productId) {
                const updatedProduct = { ...product, [field]: value };

                // Determine the new status based on the stock value
                if (field === "stock") {
                    updatedProduct.status = value === 0 ? "Out of Stock" : value < 5 ? "Low Stock" : "Active";
                }
                
                return updatedProduct;
            }
            return product;
        });

        setProducts(updatedProducts);
        calculateTotalSales(updatedProducts); // Recalculate total sales if relevant fields are updated
    } catch (error) {
        console.error("Error updating product:", error);
    }
};


    const filteredProducts = products.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCategoryChange = (e) => {
        const category = e.target.value;
        setNewProduct({ ...newProduct, category });
        setShowClothingFields(category === "Clothing");
        setShowElectronicsFields(category === "Electronics");
        setShowBeautyFields(category === "Beauty");
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewProduct({ ...newProduct, image: file });
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleAddColor = () => {
    if (currentColor.trim()) {
        setColors([...colors, currentColor.trim()]);
        setCurrentColor(""); // Clear the input after adding
    }
};

    return (
  <div style={styles.container}>
    <button style={styles.backButton} onClick={() => navigate("/account-details")}>
        Back to Account Details
    </button>
    <div style={styles.header}>
        <h2 style={styles.heading}>Seller Dashboard</h2>
      <div style={styles.summary}>
    <p style={styles.summaryItem}>Total Products: {totalProducts}</p>
    <p style={styles.summarySales}>Total Sales: R{totalSales.toFixed(2)}</p>
</div>
<div style={styles.actionSection}>
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

    </div>

  <table style={styles.table}>
   <thead>
    <tr>
        <th style={styles.tableHeader}>SKU</th>
        <th style={styles.tableHeader}>Product</th>
        <th style={styles.tableHeader}>Category</th>
        <th style={styles.tableHeader}>Stock</th>
        <th style={styles.tableHeader}>Price</th>
        <th style={styles.tableHeader}>Discount (%)</th>
        <th style={styles.tableHeader}>Discount Type</th> {/* New Header for Discount Type */}
        <th style={styles.tableHeader}>Sold</th>
        <th style={styles.tableHeader}>Status</th>
        <th style={styles.tableHeader}>Actions</th>
    </tr>
</thead>
   <tbody>
    {filteredProducts.map((product) => (
        <tr
            key={product.id}
            style={{
                ...styles.tableRow,
                ...(product.stock === 0 ? styles.outOfStockRow : product.stock < 5 ? styles.lowStockRow : {}),
            }}
        >
           <td style={styles.tableCell}>{product.SKU}</td>
<td style={{ ...styles.tableCell, ...styles.productInfo }}>
    <img src={product.imageUrl} alt={product.name} style={styles.productImage} />
    <span>{product.name}</span>
</td>
<td style={styles.tableCell}>{product.category}</td>
<td style={styles.tableCell}>
    <input
        type="number"
        value={product.stock}
        onChange={(e) => handleUpdateProduct(product.id, "stock", parseInt(e.target.value))}
        style={{
            ...styles.inputField,
            ...(product.stock === 0 ? styles.outOfStockInput : product.stock < 5 ? styles.lowStockInput : {}),
        }}
    />
</td>
<td style={styles.tableCell}>
    <input
        type="number"
        value={product.price}
        onChange={(e) => handleUpdateProduct(product.id, "price", parseFloat(e.target.value))}
        style={styles.inputField}
    />
</td>
<td style={styles.tableCell}>
    <input
        type="number"
        value={product.discount || 0}
        onChange={(e) => handleUpdateProduct(product.id, "discount", parseFloat(e.target.value))}
        style={styles.inputField}
    />
</td>
<td style={styles.tableCell}>
    <select
        value={product.discountType || "None"}
        onChange={(e) => handleUpdateProduct(product.id, "discountType", e.target.value)}
        style={styles.discountSelect}
    >
        <option value="None">None</option>
        <option value="Seasonal Discount">Seasonal Discount</option>
        <option value="Chinese New Year Discount">Chinese New Year Discount</option>
        <option value="Black Friday Discount">Black Friday Discount</option>
    </select>
</td>
<td style={styles.tableCell}>{product.soldCount || 0}</td>
<td style={styles.tableCell}>
    <span
        style={{
            ...styles.statusBadge,
            ...(product.stock === 0
                ? styles.outOfStockBadge
                : product.stock < 5
                ? styles.lowStockBadge
                : styles.activeBadge),
        }}
    >
        {product.stock === 0 ? "Out of Stock" : product.stock < 5 ? "Low Stock" : "Active"}
    </span>
</td>
<td style={styles.tableCell}>
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
            <div style={styles.modalHeader}>
                <FontAwesomeIcon icon={faPlus} style={styles.modalIcon} />
                <h3 style={styles.modalTitle}>Add New Product</h3>
                <div style={styles.modalButtons}>
                    <button onClick={() => setShowAddProductModal(false)} style={styles.modalCloseButton}>
                        Cancel
                    </button>
                    <button onClick={handleAddProduct} style={styles.modalAddButton}>Add Product</button>
                </div>
            </div>
            <div style={styles.modalSectionsContainer}>
                {/* General Information Section */}
                <div style={styles.sectionLeft}>
                    <h4 style={styles.sectionTitle}>General Information</h4>
                    <input
                        type="text"
                        placeholder="Product Name"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        style={styles.input}
                    />
                    <textarea
                        placeholder="Product Description"
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                        style={styles.textarea}
                    />

                  {showClothingFields && (
    <div style={styles.additionalFields}>
    {/* Size Selection */}
    <div style={styles.sizeContainer}>
        <label style={styles.fieldTitle}>Size</label>
        <span style={styles.fieldSubtitle}>Pick Available Size</span>
        <div style={styles.sizeOptions}>
            {["XS", "S", "M", "L", "XL", "XXL"].map((size) => (
                <button
                    key={size}
                    style={{
                        ...styles.sizeButton,
                        backgroundColor: selectedSizes.includes(size) ? "#a8e6cf" : "#f0f0f0",
                    }}
                    onClick={() => handleSizeToggle(size)}
                >
                    {size}
                </button>
            ))}
        </div>
         {/* Gender Selection */}
    <div style={styles.genderContainer}>
        <label style={styles.fieldTitle}>Gender</label>
        <span style={styles.fieldSubtitle}>Pick Available Gender</span>
        <div style={styles.genderOptions}>
            {["Men", "Women", "Unisex"].map((gender) => (
                <label key={gender} style={styles.radioLabel}>
                    <input
                        type="radio"
                        name="gender"
                        value={gender}
                        checked={selectedGender === gender}
                        onChange={() => handleGenderSelect(gender)}
                        style={{
                            ...styles.radioInput,
                            ...(selectedGender === gender && styles.radioInputChecked),
                        }}
                    />
                    {gender}
                </label>
            ))}
        </div>
    </div>
     {/* Color Options */}
    <div style={styles.colorContainer}>
        <label style={styles.fieldTitle}>Colors</label>
        <span style={styles.fieldSubtitle}>Pick Available Colors</span>
        <div style={styles.colorInputContainer}>
            <input
                type="text"
                placeholder="Enter color name or hex code"
                value={currentColor}
                onChange={(e) => setCurrentColor(e.target.value)}
                style={styles.colorInput}
            />
            <FontAwesomeIcon icon={faPlus} style={styles.addColorIcon} onClick={handleAddColor} />
        </div>
        <div style={styles.colorDisplay}>
            {colors.map((color, index) => (
                <span
                    key={index}
                    style={{
                        ...styles.colorCircle,
                        backgroundColor: color,
                    }}
                ></span>
            ))}
        </div>
    </div>
    </div>

   

   
</div>
                    )}

                    {/* Electronics-specific Fields */}
                    {showElectronicsFields && (
                        <div style={styles.additionalFields}>
                            <label>Warranty</label>
                            <input
                                type="text"
                                placeholder="Warranty Period (e.g., 1 year)"
                                value={newProduct.warranty}
                                onChange={(e) => setNewProduct({ ...newProduct, warranty: e.target.value })}
                                style={styles.input}
                            />
                        </div>
                    )}

                    {/* Beauty-specific Fields */}
                    {showBeautyFields && (
                        <div style={styles.additionalFields}>
                            <label>Ingredients</label>
                            <textarea
                                placeholder="List of Ingredients"
                                value={newProduct.ingredients}
                                onChange={(e) => setNewProduct({ ...newProduct, ingredients: e.target.value })}
                                style={styles.textarea}
                            />
                        </div>
                    )}
                </div>

                {/* Upload Image Section */}
                <div style={styles.sectionRight}>
                    <h4 style={styles.sectionTitle}>Upload Image</h4>
                    <div style={styles.imageUploadContainer}>
                        {imagePreview ? (
                            <img src={imagePreview} alt="Preview" style={styles.imagePreview} />
                        ) : (
                            <div style={styles.imagePlaceholder}>Image Preview</div>
                        )}
                        <input
                            type="file"
                            onChange={handleImageUpload}
                            style={styles.fileInput}
                            accept="image/*"
                        />
                        <label style={styles.uploadLabel}>
                            <FontAwesomeIcon icon={faUpload} /> Upload Image
                        </label>
                    </div>
                </div>

               {/* Pricing and Stock Section */}
<div style={styles.sectionLeft}>
    <h4 style={styles.sectionTitle}>Pricing And Stock</h4>
    <div style={styles.pricingStockContainer}>
     {/* Base Pricing */}
<div style={styles.inputGroup}>
    <label style={styles.fieldTitle}>Base Pricing</label>
    <input
        type="number"
        placeholder="R0.00"
        value={newProduct.price}
        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
        style={styles.pricingInput}
    />
</div>

{/* Stock */}
<div style={styles.inputGroup}>
    <label style={styles.fieldTitle}>Stock</label>
    <input
        type="number"
        placeholder="0"
        value={newProduct.stock}
        onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
        style={styles.pricingInput}
    />
</div>

{/* Discount */}
<div style={styles.inputGroup}>
    <label style={styles.fieldTitle}>Discount</label>
    <input
        type="text"
        placeholder="0%"
        value={newProduct.discount}
        onChange={(e) => setNewProduct({ ...newProduct, discount: e.target.value })}
        style={styles.pricingInput}
    />
</div>

{/* Discount Type */}
<div style={styles.inputGroup}>
    <label style={styles.fieldTitle}>Discount Type</label>
    <select
        value={newProduct.discountType}
        onChange={(e) => setNewProduct({ ...newProduct, discountType: e.target.value })}
        style={styles.discountDropdown}
    >
        <option value="None">None</option>
        <option value="Seasonal Discount">Seasonal Discount</option>
        <option value="Chinese New Year Discount">Chinese New Year Discount</option>
        <option value="Black Friday Discount">Black Friday Discount</option>
    </select>
</div>
    </div>
</div>

                {/* Category Section */}
                <div style={styles.sectionRight}>
                    <h4 style={styles.sectionTitle}>Category</h4>
                    <select
                        value={newProduct.category}
                        onChange={handleCategoryChange}
                        style={styles.dropdown}
                    >
                        <option value="">Select Category</option>
                        {categories.map(category => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </select>
                    <button style={styles.addCategoryButton}>Add Category</button>
                </div>
            </div>
           
        </div>
    </div>
)}



        </div>
    );
};

    const styles = {
    container: { padding: "20px", maxWidth: "1200px", margin: "0 auto", marginTop: "50px" },
    heading: {
    fontSize: "2.5rem",
    color: "#333",
    fontWeight: "bold",
    marginBottom: "20px",
    textAlign: "center",
    borderBottom: "2px solid #f1f1f1",
    paddingBottom: "10px",
    letterSpacing: "1px",
},
    summary: {
    display: "flex",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    padding: "20px 30px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    marginBottom: "20px",
    gap: "20px",
    alignItems: "center",
    transition: "background-color 0.3s ease",
    '&:hover': {
        backgroundColor: "#f8f9fa",
    },
},
summaryItem: {
    fontSize: "1.25rem",
    color: "#333",
    fontWeight: "bold",
    margin: "0",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
},
summarySales: {
    fontSize: "1.5rem",
    color: "#28a745",
    fontWeight: "bold",
    margin: "0",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
},
searchContainer: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#f1f1f1",
    padding: "8px 15px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    width: "400px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    transition: "box-shadow 0.3s ease",
    '&:focus-within': {
        boxShadow: "0 6px 12px rgba(0, 0, 0, 0.15)",
    },
},
   searchIcon: {
    marginRight: "10px",
    color: "#007bff",
},
searchInput: {
    border: "none",
    outline: "none",
    backgroundColor: "transparent",
    fontSize: "1rem",
    color: "#333",
    width: "100%",
    padding: "8px",
},
   addButton: {
    backgroundColor: "#28a745",
    color: "#fff",
    padding: "10px 20px",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    border: "none",
    cursor: "pointer",
    transition: "all 0.3s ease",
    '&:hover': {
        backgroundColor: "#218838",
        transform: "scale(1.05)",
    },
    '&:active': {
        transform: "scale(1.02)",
    }
},
  table: {
    width: "100%", // Ensures the table takes up the full width of its container
    maxWidth: "1800px", // Increases the table max-width to fit more content
    borderCollapse: "collapse",
    marginTop: "20px",
    backgroundColor: "#fff",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    borderRadius: "12px",
    overflow: "hidden",
},
tableHeader: {
    fontSize: "1rem",
    fontWeight: "bold",
    color: "#fff",
    backgroundColor: "#007bff",
    padding: "15px",
    textAlign: "center", // Center align the header text
    whiteSpace: "nowrap",
},
tableRow: {
    
    borderBottom: "1px solid #f1f1f1",
    transition: "background-color 0.3s ease",
},
tableCell: {
    marginTop: "10px",
    padding: "15px", // Apply consistent padding
    textAlign: "center", // Center align text in cells
    fontSize: "0.95rem",
},
    criticalRow: {
        backgroundColor: "#ffe6e6",
    },
    warningRow: {
        backgroundColor: "#fff8e6",
    },
    alertLabel: {
        backgroundColor: "#dc3545",
        color: "#fff",
        padding: "5px 10px",
        borderRadius: "5px",
        fontSize: "0.8rem",
        fontWeight: "bold",
        position: "absolute",
        top: "50%",
        left: "110%",
        transform: "translateY(-50%)",
        whiteSpace: "nowrap",
        boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
    },
    statusBadge: {
        display: "inline-block",
        padding: "6px 12px",
        borderRadius: "12px",
        fontSize: "0.85rem",
        fontWeight: "bold",
        textAlign: "center",
    },
    activeBadge: { backgroundColor: "#28a745", color: "#fff" },
      lowStockBadge: { backgroundColor: "#ffc107", color: "#333" },
     outOfStockBadge: { backgroundColor: "#dc3545", color: "#fff" },
     lowStockRow: { backgroundColor: "#fff8e6" }, 
      outOfStockRow: { backgroundColor: "#ffe6e6" },  

    actionButton: {
        padding: "6px 12px",
        backgroundColor: "#007bff",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "0.85rem",
        display: "flex",
        alignItems: "center",
        gap: "5px",
        transition: "background-color 0.3s ease",
        '&:hover': { backgroundColor: "#0056b3" },
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
discountSelect: {
    width: "100%", // Adjust dropdown to full cell width
    padding: "8px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    fontSize: "0.95rem",
    color: "#333",
    textAlign: "center", // Center align dropdown text
},
    activeStatus: { color: "#28a745", fontWeight: "bold" },
    outOfStock: { color: "#dc3545", fontWeight: "bold" },
    sizeOptions: {
        display: "flex",
        gap: "8px",
    },
    genderOptions: {
        display: "flex",
        gap: "8px",
    },
    pricingStockContainer: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr", // Two columns layout
        gap: "20px",
    },
   actionSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "20px",
    padding: "15px 20px",
    backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
},
    inputGroup: {
        display: "flex",
        flexDirection: "column",
    },
    pricingInput: {
        backgroundColor: "#ffffff",
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "10px",
        fontSize: "1rem",
        color: "#333",
        fontWeight: "bold",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)", // Add shadow for depth
        transition: "border 0.3s ease, box-shadow 0.3s ease",
        outline: "none",
        width: "60%", // Ensure full-width for each input
    },
    discountDropdown: {
        backgroundColor: "#ffffff",
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "10px",
        fontSize: "1rem",
        color: "#333",
        fontWeight: "bold",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        transition: "border 0.3s ease, box-shadow 0.3s ease",
        outline: "none",
        width: "100%", // Full width
        appearance: "none",
        position: "relative",
        direction: "rtl", // Keeps dropdown options upwards
    },
    genderButton: {
        padding: "8px 12px",
        borderRadius: "5px",
        border: "1px solid #ddd",
        cursor: "pointer",
        fontWeight: "bold",
        fontSize: "1rem",
        transition: "background-color 0.3s ease",
    },
    "@keyframes fadeIn": {
        from: { opacity: 0 },
        to: { opacity: 1 },
    },
  backButton: {
    backgroundColor: "#007bff",
    color: "#fff",
    padding: "10px 20px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "bold",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    transition: "all 0.3s ease",
    marginBottom: "20px",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    textDecoration: "none",
    '&:hover': {
        backgroundColor: "#0056b3",
        transform: "translateY(-2px)",
    },
    '&:active': {
        transform: "translateY(0px)",
    }
},
    "@keyframes slideUp": {
        from: { transform: "translateY(20px)", opacity: 0 },
        to: { transform: "translateY(0)", opacity: 1 },
    },
    modalOverlay: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
    },
    modalContent: {
        backgroundColor: "#fff",
        padding: "30px",
        borderRadius: "12px",
        width: "90%",
        height: "90%",
        maxWidth: "1200px",
        boxShadow: "0 10px 20px rgba(0, 0, 0, 0.3)",
        animation: "fadeIn 0.5s ease-in-out",
    },
    modalTitle: {
        fontSize: "1.5rem",
        marginBottom: "5px",
        marginTop: "-10px",
        fontWeight: "bold",
    },
    modalSectionsContainer: {
        display: "grid",
        gridTemplateColumns: "2fr 1fr",
        gap: "10px",
    },
    modalHeader: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "20px",
        borderBottom: "1px solid #ddd",
        paddingBottom: "10px",
    },
    modalIcon: {
        color: "#28a745",
        marginRight: "10px",
        fontSize: "1.5rem",
    },
    saveDraftButton: {
        backgroundColor: "#e0e0e0",
        color: "#333",
        padding: "8px 16px",
        borderRadius: "8px",
        fontWeight: "bold",
        border: "none",
        cursor: "pointer",
        marginRight: "10px",
    },
    sectionLeft: {
        backgroundColor: "#f8f9fa",
        padding: "20px",
        borderRadius: "8px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    },
    sectionRight: {
        backgroundColor: "#f8f9fa",
        padding: "20px",
        borderRadius: "8px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    },
    sectionTitle: {
        fontSize: "1rem",
        fontWeight: "bold",
        marginBottom: "10px",
    },
    input: {
        width: "50%",
        padding: "10px",
        marginBottom: "10px",
        borderRadius: "6px",
        border: "1px solid #ddd",
        fontSize: "1rem",
        color: "#333",
    },
    modalAddButton: {
        backgroundColor: "#28a745",
        color: "#fff",
        padding: "8px 16px",
        borderRadius: "8px",
        fontWeight: "bold",
        border: "none",
        cursor: "pointer",
    },
    textarea: {
        width: "80%",
        padding: "10px",
        height: "80px",
        resize: "vertical",
        borderRadius: "6px",
        border: "1px solid #ddd",
        fontSize: "1rem",
        color: "#333",
    },
    dropdown: {
        width: "100%",
        padding: "10px",
        borderRadius: "6px",
        border: "1px solid #ddd",
        fontSize: "1rem",
        color: "#333",
    },
    imageUploadContainer: {
        display: "flex",
        height: "300px",
        flexDirection: "column",
        alignItems: "center",
        gap: "10px",
        border: "1px dashed #ddd",
        borderRadius: "8px",
        padding: "20px",
        textAlign: "center",
        backgroundColor: "#ffffff",
    },
    imagePreview: {
        width: "100%",
        borderRadius: "8px",
        objectFit: "cover",
        maxHeight: "300px",
    },
    uploadLabel: {
        backgroundColor: "#007bff",
        color: "#fff",
        padding: "10px 20px",
        borderRadius: "8px",
        cursor: "pointer",
        display: "inline-block",
    },
    addCategoryButton: {
        backgroundColor: "#28a745",
        color: "#fff",
        padding: "10px 20px",
        borderRadius: "8px",
        fontWeight: "bold",
        border: "none",
        cursor: "pointer",
        marginTop: "10px",
        width: "100%",
        textAlign: "center",
    },
    buttonContainer: {
        display: "flex",
        justifyContent: "space-between",
        marginTop: "20px",
    },
    modalCloseButton: {
        backgroundColor: "#dc3545",
        color: "#fff",
        padding: "10px",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "1rem",
        fontWeight: "bold",
        transition: "background-color 0.3s ease",
    },
    additionalFields: {
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        marginTop: "10px",
    },
    sizeGenderContainer: { display: "flex", justifyContent: "space-between" },
    sizeContainer: {
        display: "flex",
        flexDirection: "column",
        marginRight: "20px",
    },
    genderContainer: {
        display: "flex",
        flexDirection: "column",
    },
    fieldTitle: {
        fontSize: "1rem",
        fontWeight: "bold",
        color: "#333",
        display: "block",
        marginBottom: "5px",
    },
    fieldSubtitle: {
        fontSize: "0.85rem",
        fontWeight: "normal",
        color: "#999",
        display: "block",
        marginBottom: "10px",
    },
    sizeButton: {
        padding: "8px 12px",
        borderRadius: "5px",
        border: "1px solid #ddd",
        cursor: "pointer",
        fontWeight: "bold",
        fontSize: "1rem",
        transition: "background-color 0.3s ease",
        '&:hover': {
            backgroundColor: '#e0f7fa',
        }
    },
    radioLabel: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        cursor: "pointer",
        fontSize: "1rem",
        color: "#333",
    },
    radioInput: {
        appearance: "none",
        width: "16px",
        height: "16px",
        border: "2px solid #28a745",
        borderRadius: "50%",
        cursor: "pointer",
        backgroundColor: "#fff",
        transition: "background-color 0.3s ease",
    },
    radioInputChecked: {
        backgroundColor: "#28a745",
    },
    colorContainer: {
        display: "flex",
        flexDirection: "column",
        marginTop: "15px",
    },
    colorInputContainer: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
    },
    colorInput: {
        width: "70%",
        padding: "8px",
        borderRadius: "6px",
        border: "1px solid #ddd",
        fontSize: "1rem",
    },
    addColorIcon: {
        color: "#28a745",
        cursor: "pointer",
    },
    colorDisplay: {
        display: "flex",
        gap: "8px",
        marginTop: "10px",
    },
    colorCircle: {
        width: "24px",
        height: "24px",
        borderRadius: "50%",
        border: "1px solid #ddd",
        cursor: "pointer",
    },
  
    header: {
        fontSize: "1rem",
        fontWeight: "bold",
        padding: "15px",
        color: "#333",
        backgroundColor: "#f8f9fa"
    },
   
    skuColumn: {
        minWidth: "150px",
        whiteSpace: "nowrap",
        padding: "10px"
    },
  
   
inputField: {
    width: "80%", // Adjust width to fit inside cell with padding
    padding: "6px",
    borderRadius: "4px",
    border: "1px solid #ddd",
    fontSize: "0.95rem",
    textAlign: "center",
},
    lowStockInput: {
        borderColor: "yellow",
        backgroundColor: "#fffde7"
    },
    outOfStockInput: {
        borderColor: "red",
        backgroundColor: "#ffebee"
    },
   
    alert: {
        position: "absolute",
        top: "-50px",
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: "#dc3545",
        color: "#fff",
        padding: "8px 12px",
        borderRadius: "8px",
        fontSize: "0.8rem",
        fontWeight: "bold",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        zIndex: 2,
    },
    alertArrow: {
        width: 0,
        height: 0,
        borderLeft: "6px solid transparent",
        borderRight: "6px solid transparent",
        borderTop: "6px solid #dc3545",
        marginTop: "-4px",
    },
    notification: {
        position: "absolute",
        top: "-50px",
        left: "50%",
        transform: "translateX(-50%)",
        backgroundColor: "#ffc107",
        color: "#333",
        padding: "6px 10px",
        borderRadius: "8px",
        fontSize: "0.8rem",
        fontWeight: "bold",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        zIndex: 1,
    },
    notificationArrow: {
        width: 0,
        height: 0,
        borderLeft: "6px solid transparent",
        borderRight: "6px solid transparent",
        borderTop: "6px solid #ffc107",
        marginTop: "-4px",
    },
};

export default SellerDashboard;
