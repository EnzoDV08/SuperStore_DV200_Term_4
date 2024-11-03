import React, { useState, useEffect } from "react";
import { firestore, storage, auth } from "../firebaseConfig";
import { collection, addDoc, doc, updateDoc, deleteDoc, getDoc, query, where, onSnapshot, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { FiBox, FiHeart, FiTruck, FiEye, FiStar, FiUser, FiLogOut, FiTrash2, FiMoreVertical, FiEyeOff, FiMapPin } from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import OrderManagement from "../components/OrderManagement";
import { signOut, reauthenticateWithCredential, EmailAuthProvider, deleteUser } from "firebase/auth";

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
    const [isSeller, setIsSeller] = useState(false); // Track if user is a seller
    const [showSellerSignUp, setShowSellerSignUp] = useState(false); // Control seller sign-up form visibility
    const [storeName, setStoreName] = useState("");
    const [businessType, setBusinessType] = useState("");
    const [sellerDescription, setSellerDescription] = useState("");
    const [isManualAccount, setIsManualAccount] = useState(false); // Track account type
    const [userName, setUserName] = useState(""); // Added userName state
    const [userEmail, setUserEmail] = useState(""); // Added userEmail state
    const [newUserName, setNewUserName] = useState(""); // New name for editing
    const [newUserEmail, setNewUserEmail] = useState(""); // New email for editing
    const [newPassword, setNewPassword] = useState(""); // New password for editing
    const [confirmPassword, setConfirmPassword] = useState(""); 
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [address, setAddress] = useState("");
    const [orders, setOrders] = useState([]);
    const [billingInfo, setBillingInfo] = useState({ cardNumber: "", expiryDate: "", cvv: "" });
    const navigate = useNavigate();

 // Fetch user data and check if the user is a seller
    useEffect(() => {
        const fetchUserData = async () => {
            const user = auth.currentUser;
            if (user) {
                setUserName(user.displayName || "User");
                setUserEmail(user.email);
                setProfileImage(user.photoURL || "https://via.placeholder.com/100");

                const userDoc = await getDoc(doc(firestore, "users", user.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setIsSeller(userData.sellerDetails?.isSeller || false);
                } else {
                    console.warn("User document does not exist.");
                }
            }
        };

        fetchUserData();
    }, []);

    // Fetch seller's products
    useEffect(() => {
        const fetchProductsForSeller = () => {
            const user = auth.currentUser;
            if (user && isSeller) {
                const productQuery = query(
                    collection(firestore, "products"),
                    where("sellerId", "==", user.uid)
                );

                const unsubscribe = onSnapshot(productQuery, (snapshot) => {
                    const productList = snapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    }));
                    setProducts(productList);
                });

                return () => unsubscribe();
            }
        };

        fetchProductsForSeller();
    }, [isSeller]);

    useEffect(() => {
        const user = auth.currentUser;
        if (user) {
            const productQuery = query(
                collection(firestore, "products"),
                where("userId", "==", user.uid)
            );

            const unsubscribe = onSnapshot(productQuery, (snapshot) => {
                const productList = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setProducts(productList);
            });

            // Cleanup the listener on unmount
            return () => unsubscribe();
        }
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

            // Using onSnapshot to listen for real-time updates
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

    const fetchOrders = () => {
        const user = auth.currentUser;
        if (user) {
            const ordersQuery = query(
                collection(firestore, "orders"),
                where("userId", "==", user.uid)
            );
            onSnapshot(ordersQuery, (snapshot) => {
                const orderList = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setOrders(orderList);
            });
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

     const handleOrderStatusUpdate = async (orderId, newStatus, deliveryDate) => {
        try {
            const orderRef = doc(firestore, 'orders', orderId);
            await updateDoc(orderRef, {
                status: newStatus,
                deliveryDate: deliveryDate || null,
            });
            alert('Order status updated successfully!');
        } catch (error) {
            console.error("Error updating order status: ", error);
        }
    };

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

    const handleSellerSignUp = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (user) {
        const userRef = doc(firestore, "users", user.uid);
        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) {
            await setDoc(userRef, {
                isSeller: true,
                sellerDetails: {
                    isSeller: true,
                    uid: user.uid,
                    username: user.displayName || "New Seller",
                },
            });
        } else {
            await updateDoc(userRef, {
                isSeller: true,
                "sellerDetails.isSeller": true,
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
        try {
            await updateDoc(productDocRef, { isActive: !currentStatus });
            alert(`Product is now ${!currentStatus ? "available" : "unavailable"}`);
        } catch (error) {
            console.error("Error toggling availability:", error);
            alert("Failed to toggle product availability.");
        }
    };

    const handleDiscountChange = async (id, newDiscount) => {
        const productDocRef = doc(firestore, "products", id);
        await updateDoc(productDocRef, { discountPercentage: newDiscount });
        setProducts((prevProducts) =>
            prevProducts.map((product) =>
                product.id === id
                    ? { ...product, discountPercentage: newDiscount }
                    : product
            )
        );
    };

    const calculateDiscountedPrice = (price, discount) => {
        return price - (price * discount) / 100;
    };

    const toggleDropdown = (id) => {
        setDropdownOpen((prev) => ({ ...prev, [id]: !prev[id] }));
    };

   // Handle product addition with seller verification
    const handleProductSubmit = async (e) => {
        e.preventDefault();

        const user = auth.currentUser;
        if (!user || !isSeller) {
            alert("Only authenticated sellers can upload products.");
            return;
        }

        try {
            const userDoc = await getDoc(doc(firestore, "users", user.uid));
            if (!userDoc.exists() || !userDoc.data().sellerDetails?.isSeller) {
                alert("Only authenticated sellers can upload products.");
                return;
            }

            // Proceed with image upload and product creation
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
                discountPercentage: parseFloat(discountPercentage),
                createdAt: new Date(),
                updatedAt: new Date(),
                isActive: true,
            };

            await addDoc(collection(firestore, "products"), productData);
            alert("Product added successfully.");
        } catch (error) {
            console.error("Error uploading product:", error);
            alert("There was an error uploading the product. Please try again.");
        }
    };



    const togglePasswordVisibility = (setter) => {
        setter((prevState) => !prevState);
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
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            marginBottom: "5px",
        },
        userName: {
            padding: "10px 15px 0px 5px",
            fontSize: "18px",
            fontWeight: "bold",
            color: "#fff",
            marginBottom: "5px",
        },
        userEmail: {
            padding: "10px 15px 0px 5px",
            fontSize: "14px",
            color: "#ccc",
            marginBottom: "20px",
        },
        sidebarItem: {
            display: "flex",
            gap: "10px",
            alignItems: "center",
            padding: "10px 15px 10px 10px",
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
            padding: "25px 40px 25px 40px",
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
        popupContainer: {
            backgroundColor: "#fff",
            padding: "30px",
            borderRadius: "15px",
            boxShadow: "0 10px 20px rgba(0, 0, 0, 0.3)",
            width: "400px",
            minwidth: "400px",
            textAlign: "center",
            transform: "scale(0.9)",
            animation: "scaleIn 0.5s forwards",
        },
        popupContainerSellerSignUp: {
            display: "flex",
            flexDirection: "column",
            gap: "5px",
            backgroundColor: "#fff",
            padding: "30px",
            borderRadius: "15px",
            boxShadow: "0 10px 20px rgba(0, 0, 0, 0.3)",
            width: "400px",
            height: "auto",
            textAlign: "center",
            transform: "scale(0.9)",
            animation: "scaleIn 0.5s forwards",
        },
        sellerPopUpHeader: {
            margin: "0px 0px 15px 0px",
        },
        sellerPopUpInputs: {
            display: "flex",
            flexDirection: "column",
            gap: "5px",
        },
        sellerPopUpButtons: {
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            gap: "10px",
            margin: '10px 0px 0px 0px',
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
            padding: "0",
            backgroundColor: "#ffffff",
            borderRadius: "10px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            margin: "auto",
        },
        accountDetailsHeader: {
            margin: '0px 0px 20px 0px',
            padding: '0px',
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
            gap: "10px 20px",
        },
        formGroup: {
            display: "flex",
            flexDirection: "column",
        },
        passwordSection: {
            gridColumn: "span 2",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
        },
        passwordSectionInputs: {
            display: "grid",
            gridTemplateColumns: "1fr auto",
        },
        showPasswordButton: {
            padding: "8px 15px 8px 15px",
            borderRadius: "8px",
            border: "1px solid #ddd",
            backgroundColor: "#f9f9f9",
            cursor: "pointer",
            zIndex: '2',
            margin: '0px 0px 0px -11px',
            boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.1)"
        },
        addressSection: {
            display: "grid",
            gridTemplateColumns: "1fr auto",
        },
        label: {
            fontSize: "16px",
            fontWeight: "500",
            marginBottom: "8px",
            color: "#333",
        },
        inputField: {
            boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.1)",
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid #ddd",
            fontSize: "16px",
            backgroundColor: "rgba(0, 0, 0, 0.05)",
        },
        locationButton: {
            padding: "8px 15px 8px 15px",
            borderRadius: "8px",
            border: "1px solid #ddd",
            backgroundColor: "#f9f9f9",
            cursor: "pointer",
            zIndex: '2',
            margin: '0px 0px 0px -11px',
            boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.1)"
        },
        billingHeading: {
            gridColumn: "span 2",
            padding: "0px",
            margin: "10px 0px 0px 0px",
        },
        saveChangesSection: {
            display: "flex",
            gridColumn: "span 2",
            justifyContent: 'center',
            alignItems: 'center',
        },
        saveChangesButton: {
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
                {/* User Profile Section */}
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
                <>
                    {activeSection === "dashboard" && !isSeller && (
                        <div>
                            <h2>Become a Seller</h2>
                            <p>Sign up as a seller to access the dashboard and manage your products.</p>
                            <button style={styles.addButton} onClick={() => setShowSellerSignUp(true)}>Sign Up as Seller</button>
                        </div>
                    )}

                    {isSeller && activeSection === "dashboard" && (
                        <div>
                            <h2>Welcome to your Dashboard</h2>
                            <OrderManagement orders={orders} onUpdateOrderStatus={handleOrderStatusUpdate} />
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
                                            <td>R{calculateDiscountedPrice(product.price, product.discountPercentage).toFixed(2)}</td>
                                            <td>
                                                <select
                                                    value={product.discountPercentage}
                                                    onChange={(e) =>
                                                        handleDiscountChange(product.id, parseFloat(e.target.value))
                                                    }
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

                    {activeSection === "dashboard" && showSellerSignUp && (
                        <div style={styles.formOverlay}>
                            <div style={styles.popupContainerSellerSignUp}>
                                <h3 style={styles.sellerPopUpHeader}>Sign up as a Seller</h3>
                                <form onSubmit={handleSellerSignUp}>
                                    <div style={styles.sellerPopUpInputs}>
                                        <div>
                                            <input
                                                type="text"
                                                placeholder="Store Name"
                                                value={storeName}
                                                onChange={(e) => setStoreName(e.target.value)}
                                                style={styles.inputField}
                                            />
                                        </div>
                                        <div>
                                            <input
                                                type="text"
                                                placeholder="Business Type"
                                                value={businessType}
                                                onChange={(e) => setBusinessType(e.target.value)}
                                                style={styles.inputField}
                                            />
                                        </div>
                                        <div>
                                            <textarea
                                                placeholder="Seller Description"
                                                value={sellerDescription}
                                                onChange={(e) => setSellerDescription(e.target.value)}
                                                style={styles.inputField}
                                            />
                                        </div>
                                    </div>
                                    <div style={styles.sellerPopUpButtons}>
                                        <div>
                                            <button type="submit" style={styles.confirmButton}>Submit</button>
                                        </div>
                                        <div>
                                            <button onClick={() => setShowSellerSignUp(false)} style={styles.cancelButton}>Cancel</button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {activeSection === "accountdetails" && (
                        <div style={styles.accountDetailsContainer}>
                            <h2 style={styles.accountDetailsHeader}>Account Details</h2>
                            
                            <div style={styles.profileImageSection}>
                                <img src={profileImage} alt="Profile" style={styles.profileImageLarge} />
                                <div style={styles.profileButtons}>
                                    <input
                                        type="file"
                                        onChange={(e) => handleProfileImageUpload(e.target.files[0])}
                                        style={{ display: "none" }}
                                        id="profileImageUpload"
                                    />
                                    <button onClick={() => {/*handleChangeProfileImage()*/}} style={styles.uploadButton}>Change Image</button>
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
                                    <div style={styles.addressSection}>
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
                                            <FiMapPin/>
                                        </button>
                                    </div>
                                </div>

                                <div style={styles.passwordSection}>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>New Password</label>
                                        <div style={styles.passwordSectionInputs}>
                                            <input
                                                type={showNewPassword ? "text" : "password"}
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                style={styles.inputField}
                                            />
                                            <button 
                                                style={styles.showPasswordButton} 
                                                type="button" 
                                                onClick={() => togglePasswordVisibility(setShowNewPassword)}>   
                                                    {showNewPassword ? <FiEyeOff /> : <FiEye />}
                                            </button>
                                        </div>
                                    </div>

                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Confirm New Password</label>
                                        <div style={styles.passwordSectionInputs}>
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                style={styles.inputField}
                                            />
                                            <button 
                                                style={styles.showPasswordButton} 
                                                type="button" 
                                                onClick={() => togglePasswordVisibility(setShowConfirmPassword)}>
                                                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <h3 style={styles.billingHeading} title="For Demonstration Purposes Only">Billing Information</h3>
                                <div style={styles.formGroup} title="For Demonstration Purposes Only">
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

                                <div style={styles.formGroup} title="For Demonstration Purposes Only">
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

                                <div style={styles.formGroup} title="For Demonstration Purposes Only">
                                    <label style={styles.label}>CVV</label>
                                    <input
                                        type="password"
                                        value={billingInfo.cvv}
                                        onChange={(e) =>
                                            setBillingInfo({ ...billingInfo, cvv: e.target.value })
                                        }
                                        style={styles.inputField}
                                        placeholder="123"
                                    />
                                </div>

                                <div style={styles.saveChangesSection}>
                                    <button type="submit" style={styles.saveChangesButton}>
                                        Save Changes
                                    </button>
                                </div>
                            </form>
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

                    {showAddProductForm && (
                        <div style={styles.formOverlay}>
                            <div style={styles.formContainer}>
                                <h3>Add New Product</h3>
                                <form onSubmit={handleProductSubmit}>
                                    <input type="text" placeholder="Product Name" value={productName} onChange={(e) => setProductName(e.target.value)} style={{ margin: "10px 0", padding: "10px" }} />
                                    <input type="number" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} style={{ margin: "10px 0", padding: "10px" }} />
                                    <input type="number" placeholder="Stock" value={stock} onChange={(e) => setStock(e.target.value)} style={{ margin: "10px 0", padding: "10px" }} />
                                    <input type="text" placeholder="Category" value={category} onChange={(e) => setCategory(e.target.value)} style={{ margin: "10px 0", padding: "10px" }} />
                                    <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} style={{ margin: "10px 0", padding: "10px", height: "80px" }} />
                                    <input type="file" onChange={(e) => setImage(e.target.files[0])} style={{ margin: "10px 0", padding: "10px" }} />
                                    <button type="submit" style={{ marginTop: "20px", padding: "10px", backgroundColor: "#007bff", color: "#fff", borderRadius: "5px", cursor: "pointer" }}>Add Product</button>
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
                </>
            </div>
        </div>
    );
};

export default Dashboard;