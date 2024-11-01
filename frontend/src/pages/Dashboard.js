import React, { useState, useEffect } from "react";
import { firestore, storage, auth } from "../firebaseConfig";
import { collection, addDoc, doc, updateDoc, deleteDoc, getDoc, query, where, onSnapshot, setDoc, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { FiBox, FiHeart, FiTruck, FiEye, FiStar, FiUser, FiLogOut, FiTrash2, FiMoreVertical } from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import { signOut, reauthenticateWithCredential, EmailAuthProvider, deleteUser } from "firebase/auth";
/* eslint-enable no-unused-vars */

const Dashboard = () => {
    const location = useLocation();
    const [activeSection, setActiveSection] = useState(location.state?.section || "dashboard");
    const [products, setProducts] = useState([]);
    const [wishlistItems, setWishlistItems] = useState([]);
    const [productName, setProductName] = useState("");
    const [price, setPrice] = useState("");
    const [stock, setStock] = useState("");
    const [category, setCategory] = useState("");
    const [profileImage, setProfileImage] = useState(null);
    const [description, setDescription] = useState("");
    const [discountPercentage, setDiscountPercentage] = useState(0);
    const [image, setImage] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState({});
    const [showAddProductForm, setShowAddProductForm] = useState(false);
    const [showLogoutPopup, setShowLogoutPopup] = useState(false);
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [password, setPassword] = useState("");
    const [isSeller, setIsSeller] = useState(false);
    const [showSellerSignUp, setShowSellerSignUp] = useState(false); // eslint-disable-line no-unused-vars
    const [storeName, setStoreName] = useState(""); // eslint-disable-line no-unused-vars
    const [businessType, setBusinessType] = useState(""); // eslint-disable-line no-unused-vars
    const [sellerDescription, setSellerDescription] = useState(""); // eslint-disable-line no-unused-vars
    const [isManualAccount, setIsManualAccount] = useState(false);
    const [userName, setUserName] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [newUserName, setNewUserName] = useState("");
    const [newUserEmail, setNewUserEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [address, setAddress] = useState("");
    const [reorderLevel, setReorderLevel] = useState("");
    const [supplierName, setSupplierName] = useState("");
    const [sku, setSku] = useState("");
    const [billingInfo, setBillingInfo] = useState({ cardNumber: "", expiryDate: "", cvv: "" });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            const user = auth.currentUser;
            if (user) {
                console.log("User object:", user); // Log the entire user object to inspect properties

                // Get user's name and email
                setUserName(user.displayName || "User");
                setUserEmail(user.email);

                // Get profile image URL from Google account if available
                const photoURL = user.photoURL || "https://via.placeholder.com/100"; // Placeholder image
                console.log("Photo URL:", photoURL); // Log the photo URL for debugging
                setProfileImage(photoURL);

                // Check seller status in Firestore
                const userDoc = await getDoc(doc(firestore, "users", user.uid));
                if (userDoc.exists() && userDoc.data().sellerDetails?.isSeller) {
                    setIsSeller(true);
                }
            } else {
                console.warn("No user is currently authenticated.");
            }
        };
        fetchUserData();
    }, []);


  useEffect(() => {
        const checkAccountType = () => {
            const user = auth.currentUser;
            if (user) {
                const isManual = user.providerData.some((provider) => provider.providerId === "password");
                setIsManualAccount(isManual);
            }
        };
        checkAccountType();
    }, []);

    useEffect(() => {
        if (location.state?.section) {
            setActiveSection(location.state.section);
        }
    }, [location.state]);

    const fetchProducts = () => {
    const user = auth.currentUser;
    if (user) {
        const productQuery = query(
            collection(firestore, "products"),
            where("userId", "==", user.uid)
        );

        getDocs(productQuery).then((snapshot) => {
            const productList = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setProducts(productList);
        });

        onSnapshot(productQuery, (snapshot) => {
            const productList = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setProducts(productList);
        });
    }
};

useEffect(() => {
    fetchProducts(); // Initial fetch on component mount
}, []);

   const fetchWishlistItems = () => {
        const user = auth.currentUser;
        if (user) {
            const wishlistQuery = query(
                collection(firestore, "wishlist"),
                where("userId", "==", user.uid)
            );

            onSnapshot(wishlistQuery, (snapshot) => {
                const wishlistList = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setWishlistItems(wishlistList);
            });
        }
    };


    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate("/signin");
            setShowLogoutPopup(false);
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

       const handleSellerSignUp = async (e) => { // eslint-disable-line no-unused-vars
        e.preventDefault();
        const user = auth.currentUser;
        if (user) {
            const userRef = doc(firestore, "users", user.uid);
    
            // Check if the user document exists
            const userDoc = await getDoc(userRef);
    
            if (!userDoc.exists()) {
                // If the document does not exist, create it first
                await setDoc(userRef, {
                    email: user.email,
                    username: user.displayName || "New User", // You might want to get username input or set a default
                    sellerDetails: {
                        storeName,
                        businessType,
                        sellerDescription,
                        isSeller: true,
                    },
                    createdAt: new Date(),
                });
            } else {
                // If the document exists, update it with seller details
                await updateDoc(userRef, {
                    sellerDetails: {
                        storeName,
                        businessType,
                        sellerDescription,
                        isSeller: true,
                    },
                });
            }
    
            setIsSeller(true);
            setShowSellerSignUp(false);
        }
    };
   const handleDeleteAccount = async () => {
        const user = auth.currentUser;
        if (isManualAccount) {
            const credential = EmailAuthProvider.credential(user.email, password);
            try {
                await reauthenticateWithCredential(user, credential);
                await deleteUser(user);
                navigate("/signin");
                setShowDeletePopup(false);
            } catch (error) {
                console.error("Error deleting account:", error);
                alert("Error deleting account. Please try again.");
            }
        } else {
            try {
                await deleteUser(user);
                navigate("/signin");
                setShowDeletePopup(false);
            } catch (error) {
                console.error("Error deleting account:", error);
                alert("Error deleting account. Please try again.");
            }
        }
    };

 const handleProfileImageUpload = async (file) => {
    if (!file) return;
    const user = auth.currentUser;
    const imageRef = ref(storage, `profileImages/${user.uid}/${file.name}`);
    await uploadBytes(imageRef, file);
    const imageUrl = await getDownloadURL(imageRef);
    setProfileImage(imageUrl);

    // Update Firestore with the new image URL
    await updateDoc(doc(firestore, "users", user.uid), { photoURL: imageUrl });

    return imageUrl;
};

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        const user = auth.currentUser;

        try {
            if (newUserName !== user.displayName) {
                await updateDoc(doc(firestore, "users", user.uid), { displayName: newUserName });
                setUserName(newUserName);
            }
            if (newUserEmail !== user.email) {
                await user.updateEmail(newUserEmail);
                setUserEmail(newUserEmail);
            }
            if (newPassword && newPassword === confirmPassword) {
                await user.updatePassword(newPassword);
                alert("Password updated successfully.");
            }
            if (address) {
                await updateDoc(doc(firestore, "users", user.uid), { address });
            }
            alert("Profile updated successfully.");
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Error updating profile. Please try again.");
        }
    };

      const fetchLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;
                const detectedAddress = `Lat: ${latitude}, Long: ${longitude}`;
                setAddress(detectedAddress);

                const user = auth.currentUser;
                if (user) {
                    await updateDoc(doc(firestore, "users", user.uid), { address: detectedAddress });
                }
            }, () => {
                alert("Failed to retrieve location.");
            });
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    };


    // eslint-disable-next-line no-unused-vars
const handleRemoveProfileImage = async () => {
    const user = auth.currentUser;
    const placeholderImage = "https://via.placeholder.com/100";
    setProfileImage(placeholderImage);

    try {
        await updateDoc(doc(firestore, "users", user.uid), { photoURL: placeholderImage });
        await user.updateProfile({ photoURL: placeholderImage });
    } catch (error) {
        console.error("Error removing profile image:", error);
    }
};



 const handleRemoveFromWishlist = async (id) => {
        await deleteDoc(doc(firestore, "wishlist", id));
        fetchWishlistItems();
    };
    const handleDeleteProduct = async (id) => {
        await deleteDoc(doc(firestore, "products", id));
        fetchProducts();
    };

    const handleEditProduct = (id) => {
        navigate(`/product/edit/${id}`);
    };

    const handleAvailabilityToggle = async (id, currentStatus) => {
        const productDocRef = doc(firestore, "products", id);
        await updateDoc(productDocRef, { isActive: !currentStatus });
    };

    const handleDiscountChange = async (id, newDiscount) => {
        const productDocRef = doc(firestore, "products", id);
        await updateDoc(productDocRef, { discountPercentage: newDiscount });
    };

    const toggleDropdown = (id) => {
        setDropdownOpen((prev) => ({ ...prev, [id]: !prev[id] }));
    };


    const handleProductSubmit = async (e) => {
        e.preventDefault();
        if (!image || stock <= 0) {
            alert("Please upload an image and set a positive stock amount");
            return;
        }
        const user = auth.currentUser;
        if (!user) {
            alert("User must be signed in to upload products.");
            return;
        }

        const imageRef = ref(storage, `products/${user.uid}/${image.name}`);
        await uploadBytes(imageRef, image);
        const imageUrl = await getDownloadURL(imageRef);

        const productData = {
            userId: user.uid,
            name: productName,
            description,
            price: parseFloat(price),
            stock: parseInt(stock),
            imageUrl,
            category,
            discountPercentage: parseFloat(discountPercentage),
            createdAt: new Date(),
            updatedAt: new Date(),
            isActive: true,
            rating: 4.5,
            soldCount: 0,
        };
        await addDoc(collection(firestore, "products"), productData);

        setProductName("");
        setPrice("");
        setStock("");
        setImage(null);
        setDescription("");
        setCategory("");
        setDiscountPercentage(0);
        setShowAddProductForm(false);
        fetchProducts();
    };

   const styles = {
     dashboardContainer: {
        display: "flex",
        flexDirection: "row",
        backgroundColor: "#f5f7fa",
        borderRadius: "12px",
        boxShadow: "0 6px 12px rgba(0, 0, 0, 0.1)",
        overflow: "hidden",
        width: "95%",
        maxWidth: "1600px",
        margin: "50px auto",
        minHeight: "700px",
    },
    sidebar: {
        width: "270px",
        backgroundColor: "#333",
        color: "#fff",
        padding: "30px 20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "15px",
    },
      profileImage: {
        width: "100px",
        height: "100px",
        borderRadius: "50%",
        marginBottom: "15px",
    },
    userName: {
        fontSize: "18px",
        fontWeight: "bold",
        color: "#fff",
        marginBottom: "5px",
    },
    userEmail: {
        fontSize: "14px",
        color: "#ccc",
        marginBottom: "20px",
    },
     sidebarItem: {
        display: "flex",
        alignItems: "center",
        padding: "10px 15px",
        color: "#fff",
        textDecoration: "none",
        cursor: "pointer",
        borderRadius: "8px",
        width: "100%",
        transition: "background-color 0.2s ease",
        fontSize: "16px",
    },
    sidebarItemActive: {
        backgroundColor: "#28a745",
    },
    content: {
        flex: 1,
        padding: "40px",
        backgroundColor: "#ffffff",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    productTable: {
        width: "100%",
        borderSpacing: "0 15px",
        marginBottom: "20px",
    },
    tableHeader: {
        backgroundColor: "#f0f0f0",
        padding: "20px",
        fontWeight: "bold",
        textAlign: "left",
        fontSize: "18px",
    },
    tableRow: {
        backgroundColor: "#fff",
        padding: "15px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.05)",
        borderRadius: "8px",
        marginBottom: "10px",
        fontSize: "16px",
        transition: "transform 0.2s ease",
    },
    discountDropdown: {
        padding: "8px",
        borderRadius: "4px",
        border: "1px solid #ddd",
        backgroundColor: "#f9f9f9",
        cursor: "pointer",
    },
    actionButton: {
        position: "relative",
        cursor: "pointer",
        transition: "background-color 0.3s ease",
        fontSize: "20px",
    },
    dropdownMenu: {
        position: "absolute",
        top: "100%",
        right: "0",
        backgroundColor: "#fff",
        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
        borderRadius: "8px",
        zIndex: 10,
        minWidth: "150px",
    },
    dropdownItem: {
        padding: "10px",
        cursor: "pointer",
        color: "#333",
        textAlign: "left",
        transition: "background-color 0.2s ease",
    },
    dropdownItemRemove: {
        color: "red",
        padding: "10px",
        cursor: "pointer",
        transition: "background-color 0.2s ease",
    },
   formOverlay: {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        transition: "opacity 0.3s ease-in-out",
    },
      cardContainer: {
        width: "380px",
        padding: "20px",
        backgroundColor: "#ffffff",
        borderRadius: "15px",
        boxShadow: "0 6px 12px rgba(0, 0, 0, 0.2)",
        textAlign: "center",
    },
      imagePlaceholder: {
        width: "100%",
        height: "150px",
        backgroundColor: "#f0f0f0",
        borderRadius: "8px",
        marginBottom: "20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#888",
        fontSize: "16px",
    },
    inputGroup: {
        display: "flex",
        alignItems: "center",
        marginBottom: "15px",
        position: "relative",
    },
    randSymbol: {
        position: "absolute",
        left: "10px",
        fontSize: "14px",
        color: "#888",
    },
       inputField: {
        width: "100%",
        padding: "10px 10px 10px 25px", // Leave space for rand symbol
        borderRadius: "6px",
        border: "1px solid #ddd",
        fontSize: "14px",
        backgroundColor: "#f9f9f9",
    },
    inputFieldWithExample: {
        width: "100%",
        padding: "10px",
        borderRadius: "6px",
        border: "1px solid #ddd",
        fontSize: "14px",
        backgroundColor: "#f9f9f9",
        marginBottom: "15px",
    },
    label: {
        textAlign: "left",
        fontSize: "14px",
        marginBottom: "5px",
    },
    popupContainer: {
        backgroundColor: "#fff",
        padding: "30px",
        borderRadius: "15px",
        boxShadow: "0 10px 20px rgba(0, 0, 0, 0.3)",
        width: "400px",
        textAlign: "center",
        transform: "scale(0.9)",
        animation: "scaleIn 0.5s forwards",
    },
    popupHeader: {
        fontSize: "22px",
        marginBottom: "20px",
    },
    inputFieldPrimary: {  // Renamed to avoid duplication
        width: "100%",
        padding: "10px",
        marginBottom: "20px",
        borderRadius: "8px",
        border: "1px solid #ddd",
    },
    buttonGroup: {
        display: "flex",
        justifyContent: "space-between",
    },
    confirmButton: {
        backgroundColor: "#ff4c4c",
        padding: "10px 20px",
        borderRadius: "8px",
        color: "#fff",
        cursor: "pointer",
        border: "none",
    },
    cancelButton: {
        backgroundColor: "#ccc",
        padding: "10px 20px",
        borderRadius: "8px",
        color: "#333",
        cursor: "pointer",
        border: "none",
    },
      accountDetailsContainer: {
        width: "100%",
        maxWidth: "800px",
        padding: "40px",
        backgroundColor: "#ffffff",
        borderRadius: "10px",
        boxShadow: "0 6px 12px rgba(0, 0, 0, 0.1)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        margin: "auto",
    },
    profileImageSection: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginBottom: "30px",
    },
    profileImageLarge: {
        width: "120px",
        height: "120px",
        borderRadius: "50%",
        marginBottom: "10px",
        objectFit: "cover",
        border: "2px solid #ddd",
    },
    profileButtons: {
        display: "flex",
        gap: "10px",
        marginTop: "10px",
    },
    uploadButton: {
        padding: "8px 16px",
        backgroundColor: "#3b82f6",
        color: "#fff",
        borderRadius: "6px",
        border: "none",
        cursor: "pointer",
    },
    removeButton: {
        padding: "8px 16px",
        backgroundColor: "#ff4c4c",
        color: "#fff",
        borderRadius: "6px",
        border: "none",
        cursor: "pointer",
    },
    accountForm: {
        width: "100%",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "20px",
    },
    formGroup: {
        display: "flex",
        flexDirection: "column",
    },
    saveChangesButton: {
        gridColumn: "span 2",
        padding: "14px",
        backgroundColor: "#3b82f6",
        color: "#fff",
        borderRadius: "8px",
        border: "none",
        cursor: "pointer",
        fontSize: "16px",
        marginTop: "20px",
    },
};


    return (
       <div style={styles.dashboardContainer}>
            <div style={styles.sidebar}>
                <img src={profileImage} alt="Profile" style={styles.profileImage} />
                <div style={styles.userName}>{userName}</div>
                <div style={styles.userEmail}>{userEmail}</div>

                {/* Sidebar Navigation */}
                {[{ label: "Dashboard", icon: <FiUser />, key: "dashboard" },
                  { label: "Orders", icon: <FiBox />, key: "orders" },
                  { label: "Tracking Orders", icon: <FiTruck />, key: "trackingorders" },
                  { label: "Wishlist", icon: <FiHeart />, key: "wishlist" },
                  { label: "Recently Viewed", icon: <FiEye />, key: "recentlyviewed" },
                  { label: "Reviews", icon: <FiStar />, key: "reviews" },
                  { label: "Account Details", icon: <FiUser />, key: "accountdetails" }]
                  .map((item) => (
                    <div
                        key={item.key}
                        style={{
                            ...styles.sidebarItem,
                            ...(activeSection === item.key ? styles.sidebarItemActive : {}),
                        }}
                        onClick={() => setActiveSection(item.key)}
                    >
                        <span>{item.icon}</span>
                        {item.label}
                    </div>
                ))}
                <div style={{ ...styles.sidebarItem, color: "red" }} onClick={() => setShowLogoutPopup(true)}>
                    <FiLogOut /> Log out
                </div>
                <div style={{ ...styles.sidebarItem, color: "red" }} onClick={() => setShowDeletePopup(true)}>
                    <FiTrash2 /> Delete Account
                </div>
            </div>

           <div style={styles.content}>
                {isSeller ? (
                    <>
                        {activeSection === "dashboard" && (
                            <div>
                                <h2>Welcome to your Dashboard</h2>
                                <p>Manage your products and account details here.</p>
                                <h3>Your Products</h3>
                                <table style={styles.productTable}>
                                    <thead>
                                        <tr>
                                            <th style={styles.tableHeader}>Image</th>
                                            <th style={styles.tableHeader}>Name</th>
                                            <th style={styles.tableHeader}>Category</th>
                                            <th style={styles.tableHeader}>Stock</th>
                                            <th style={styles.tableHeader}>Price</th>
                                            <th style={styles.tableHeader}>Discount</th>
                                            <th style={styles.tableHeader}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.map((product) => (
                                            <tr key={product.id} style={styles.tableRow}>
                                                <td><img src={product.imageUrl} alt={product.name} style={{ width: "50px", borderRadius: "5px" }} /></td>
                                                <td>{product.name}</td>
                                                <td>{product.category}</td>
                                                <td>{product.stock}</td>
                                                <td>R{product.price.toFixed(2)}</td>
                                                <td>
                                                    <select
                                                        value={product.discountPercentage}
                                                        onChange={(e) => handleDiscountChange(product.id, e.target.value)}
                                                        style={styles.discountDropdown}
                                                    >
                                                        <option value={0}>0%</option>
                                                        <option value={5}>5%</option>
                                                        <option value={10}>10%</option>
                                                        <option value={15}>15%</option>
                                                        <option value={20}>20%</option>
                                                    </select>
                                                </td>
                                                <td>
                                                    <div style={styles.actionButton}>
                                                        <FiMoreVertical
                                                            onClick={() => toggleDropdown(product.id)}
                                                            style={{ cursor: "pointer" }}
                                                        />
                                                        {dropdownOpen[product.id] && (
                                                            <div style={styles.dropdownMenu}>
                                                                <div style={styles.dropdownItem} onClick={() => handleEditProduct(product.id)}>Edit</div>
                                                                <div style={styles.dropdownItem} onClick={() => handleAvailabilityToggle(product.id, product.isActive)}>
                                                                    {product.isActive ? "Make Unavailable" : "Make Available"}
                                                                </div>
                                                                <div style={styles.dropdownItemRemove} onClick={() => handleDeleteProduct(product.id)}>Remove</div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <button style={styles.addButton} onClick={() => setShowAddProductForm(true)}>
                                    Add Product
                                </button>
                            </div>
                        )}


                       {activeSection === "wishlist" && (
                            <div>
                                <h2>Your Wishlist</h2>
                                <p>Items you have added to your wishlist:</p>
                                <table style={styles.productTable}>
                                    <thead>
                                        <tr>
                                            <th style={styles.tableHeader}>Image</th>
                                            <th style={styles.tableHeader}>Name</th>
                                            <th style={styles.tableHeader}>Category</th>
                                            <th style={styles.tableHeader}>Price</th>
                                            <th style={styles.tableHeader}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {wishlistItems.map((item) => (
                                            <tr key={item.id} style={styles.tableRow}>
                                                <td><img src={item.imageUrl} alt={item.name} style={{ width: "50px", borderRadius: "5px" }} /></td>
                                                <td>{item.name}</td>
                                                <td>{item.category}</td>
                                                <td>R{item.price.toFixed(2)}</td>
                                                <td>
                                                    <button onClick={() => handleRemoveFromWishlist(item.id)} style={styles.actionButton}>
                                                        Remove
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                ) : (
                    <div>
                        <h2>Become a Seller</h2>
                        <p>Sign up as a seller to access the dashboard and manage your products.</p>
                        <button style={styles.addButton} onClick={() => setShowSellerSignUp(true)}>Sign Up as Seller</button>
                    </div>
                )}
                 
                
                 
{showAddProductForm && (
    <div style={styles.formOverlay}>
        <div style={styles.uploadFormContainer}>
            <h3 style={styles.uploadFormHeader}>Add New Product</h3>
            <form onSubmit={handleProductSubmit} style={styles.uploadForm}>
                
                <div style={styles.formSection}>
                    <label style={styles.label}>Product Name</label>
                    <input
                        type="text"
                        placeholder="Enter product name"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        style={styles.inputField}
                    />
                </div>

                <div style={styles.formSection}>
                    <label style={styles.label}>Price (R)</label>
                    <input
                        type="number"
                        placeholder="Enter price"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        style={styles.inputField}
                    />
                </div>

                <div style={styles.formSection}>
                    <label style={styles.label}>Stock Quantity</label>
                    <input
                        type="number"
                        placeholder="Enter stock quantity"
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                        style={styles.inputField}
                    />
                </div>

                <div style={styles.formSection}>
                    <label style={styles.label}>Category</label>
                    <input
                        type="text"
                        placeholder="Enter category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        style={styles.inputField}
                    />
                </div>

                <div style={styles.formSection}>
                    <label style={styles.label}>Product Description</label>
                    <textarea
                        placeholder="Enter product description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        style={{ ...styles.inputField, height: "80px" }}
                    />
                </div>

                <div style={styles.formSection}>
                    <label style={styles.label}>Reorder Level</label>
                    <input
                        type="number"
                        placeholder="Enter reorder level"
                        value={reorderLevel}
                        onChange={(e) => setReorderLevel(e.target.value)}
                        style={styles.inputField}
                    />
                </div>

                <div style={styles.formSection}>
                    <label style={styles.label}>Supplier Name</label>
                    <input
                        type="text"
                        placeholder="Enter supplier name"
                        value={supplierName}
                        onChange={(e) => setSupplierName(e.target.value)}
                        style={styles.inputField}
                    />
                </div>

                <div style={styles.formSection}>
                    <label style={styles.label}>SKU (Stock Keeping Unit)</label>
                    <input
                        type="text"
                        placeholder="Enter SKU"
                        value={sku}
                        onChange={(e) => setSku(e.target.value)}
                        style={styles.inputField}
                    />
                </div>

                <div style={styles.formSection}>
                    <label style={styles.label}>Discount Percentage (%)</label>
                    <input
                        type="number"
                        placeholder="Enter discount"
                        value={discountPercentage}
                        onChange={(e) => setDiscountPercentage(e.target.value)}
                        style={styles.inputField}
                    />
                </div>

                <div style={styles.formSection}>
                    <label style={styles.label}>Product Image</label>
                    <input
                        type="file"
                        onChange={(e) => setImage(e.target.files[0])}
                        style={styles.inputField}
                    />
                </div>

                <button type="submit" style={styles.confirmButton}>Add Product</button>
                <button onClick={() => setShowAddProductForm(false)} style={styles.cancelButton}>Cancel</button>
            </form>
        </div>
    </div>
)}



            {showLogoutPopup && (
                <div style={styles.formOverlay}>
                    <div style={styles.popupContainer}>
                        <div style={styles.popupHeader}>Are you sure you want to log out?</div>
                        <div style={styles.buttonGroup}>
                            <button style={styles.confirmButton} onClick={handleLogout}>Logout</button>
                            <button style={styles.cancelButton} onClick={() => setShowLogoutPopup(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

       <div style={styles.content}>
              {activeSection === "accountdetails" && (
    <div style={styles.accountDetailsContainer}>
        <h2>Account Details</h2>
        
        <div style={styles.profileImageSection}>
            <img src={profileImage} alt="Profile" style={styles.profileImageLarge} />
            <div style={styles.profileButtons}>
                <input
                    type="file"
                    onChange={(e) => handleProfileImageUpload(e.target.files[0])}
                    style={{ display: "none" }}
                    id="profileImageUpload"
                />
                <label htmlFor="profileImageUpload" style={styles.uploadButton}>Upload New Image</label>
                <button onClick={() => handleRemoveProfileImage()} style={styles.removeButton}>Remove Image</button>
            </div>
        </div>

        <form onSubmit={handleUpdateProfile} style={styles.accountForm}>
            <div style={styles.formGroup}>
                <label style={styles.label}>Username</label>
                <input
                    type="text"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    style={styles.inputField}
                />
            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Email</label>
                                <input
                                    type="email"
                                    value={newUserEmail}
                                    onChange={(e) => setNewUserEmail(e.target.value)}
                                    style={styles.inputField}
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Address</label>
                                <input
                                    type="text"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    style={styles.inputField}
                                />
                                <button
                                    type="button"
                                    onClick={fetchLocation}
                                    style={styles.locationButton}
                                >
                                    Auto-fill Location
                                </button>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>New Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    style={styles.inputField}
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Confirm New Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    style={styles.inputField}
                                />
                            </div>

                            <h3>Billing Information (for demonstration)</h3>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Card Number</label>
                                <input
                                    type="text"
                                    value={billingInfo.cardNumber}
                                    onChange={(e) =>
                                        setBillingInfo({ ...billingInfo, cardNumber: e.target.value })
                                    }
                                    style={styles.inputField}
                                    placeholder="1234 5678 9123 4567"
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Expiry Date</label>
                                <input
                                    type="text"
                                    value={billingInfo.expiryDate}
                                    onChange={(e) =>
                                        setBillingInfo({ ...billingInfo, expiryDate: e.target.value })
                                    }
                                    style={styles.inputField}
                                    placeholder="MM/YY"
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>CVV</label>
                                <input
                                    type="text"
                                    value={billingInfo.cvv}
                                    onChange={(e) =>
                                        setBillingInfo({ ...billingInfo, cvv: e.target.value })
                                    }
                                    style={styles.inputField}
                                    placeholder="123"
                                />
                            </div>

                            <button type="submit" style={styles.saveChangesButton}>
                                Save Changes
                            </button>
                        </form>
                    </div>
                )}
            </div>
        

 <div style={styles.content}>
  
            {showLogoutPopup && (
                <div style={styles.formOverlay}>
                    <div style={styles.popupContainer}>
                        <div style={styles.popupHeader}>Are you sure you want to log out?</div>
                        <div style={styles.buttonGroup}>
                            <button style={styles.confirmButton} onClick={handleLogout}>Logout</button>
                            <button style={styles.cancelButton} onClick={() => setShowLogoutPopup(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {showDeletePopup && (
                <div style={styles.formOverlay}>
                    <div style={styles.popupContainer}>
                        <div style={styles.popupHeader}>
                            {isManualAccount ? "Enter your password to delete your account:" : "Are you sure you want to delete your account?"}
                        </div>
                        {isManualAccount && (
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={styles.inputField}
                            />
                        )}
                        <div style={styles.buttonGroup}>
                            <button style={styles.confirmButton} onClick={handleDeleteAccount}>Delete</button>
                            <button style={styles.cancelButton} onClick={() => setShowDeletePopup(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
                
            </div>

  
);
};

export default Dashboard;