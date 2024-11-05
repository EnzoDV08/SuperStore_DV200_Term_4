import React, { useState, useEffect } from "react";
import { auth, firestore, storage } from "../firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../pages/animate.css"; 

const AccountDetails = () => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [profileImageURL, setProfileImageURL] = useState("");
    const [profileImagePath, setProfileImagePath] = useState("");
    const [role, setRole] = useState("buyer"); // Track user role
    const [showSellerForm, setShowSellerForm] = useState(false); // Popup form visibility
    const [businessName, setBusinessName] = useState("");
    const [productType, setProductType] = useState("");
    const [description, setDescription] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            const user = auth.currentUser;
            if (user) {
                const userDoc = await getDoc(doc(firestore, "users", user.uid));
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    setFirstName(data.firstName || "");
                    setLastName(data.lastName || "");
                    setEmail(data.email || "");
                    setProfileImageURL(data.profileImageURL || "");
                    setProfileImagePath(data.profileImagePath || "");
                    setRole(data.role || "buyer"); // Set the user's role
                }
            }
        };
        fetchUserData();
    }, []);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        const user = auth.currentUser;
        if (user) {
            try {
                const userRef = doc(firestore, "users", user.uid);
                await updateDoc(userRef, {
                    firstName,
                    lastName,
                    email,
                });
                toast.success("Profile updated successfully.");
            } catch (error) {
                console.error("Error updating profile:", error);
                toast.error("Failed to update profile.");
            }
        }
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const user = auth.currentUser;
            if (user) {
                try {
                    if (profileImagePath) {
                        const previousRef = ref(storage, profileImagePath);
                        await deleteObject(previousRef);
                    }

                    const filePath = `profileImages/${user.uid}/${file.name}`;
                    const storageRef = ref(storage, filePath);
                    await uploadBytes(storageRef, file);
                    const downloadURL = await getDownloadURL(storageRef);

                    await updateDoc(doc(firestore, "users", user.uid), {
                        profileImageURL: downloadURL,
                        profileImagePath: filePath,
                    });

                    setProfileImageURL(downloadURL);
                    setProfileImagePath(filePath);
                    toast.success("Profile image uploaded successfully.");
                } catch (error) {
                    console.error("Error uploading profile image:", error);
                    toast.error("Failed to upload profile image.");
                }
            }
        }
    };

    const handleRemoveImage = async () => {
        const user = auth.currentUser;
        if (user && profileImagePath) {
            try {
                const storageRef = ref(storage, profileImagePath);
                await deleteObject(storageRef);

                await updateDoc(doc(firestore, "users", user.uid), {
                    profileImageURL: "",
                    profileImagePath: "",
                });

                setProfileImageURL("https://via.placeholder.com/150");
                setProfileImagePath("");
                toast.success("Profile image removed successfully.");
            } catch (error) {
                console.error("Error removing profile image:", error);
                toast.error("Failed to remove profile image.");
            }
        } else {
            toast.error("No profile image to remove.");
        }
    };

    const handleBecomeSeller = async () => {
        try {
            const user = auth.currentUser;
            if (user) {
                await updateDoc(doc(firestore, "users", user.uid), {
                    role: "seller",
                    businessName,
                    productType,
                    description,
                });
                setRole("seller"); // Update role locally
                setShowSellerForm(false); // Close the form
                toast.success("Successfully upgraded to seller!");
            }
        } catch (error) {
            console.error("Error updating user role:", error);
            toast.error("Failed to become a seller.");
        }
    };

    return (
        <div style={styles.container}>
            <ToastContainer />
            <Sidebar
                profileImageURL={profileImageURL}
                firstName={firstName}
                lastName={lastName}
                email={email}
                onImageChange={handleImageChange}
                onRemoveImage={handleRemoveImage}
            />
            
            <div style={styles.mainContent}>
                 <div style={styles.imageButtons}>
                    <div 
                        style={{ ...styles.imageButton, backgroundImage: `url(${require('../assets/ImgButton1.png')})` }}
                        onClick={() => navigate('/order-tracking')}
                    >
                        <div style={styles.overlay}>
                            <h3 style={styles.buttonTitle}>Order Tracking</h3>
                            <p style={styles.buttonSubtitle}>See your order history.</p>
                        </div>
                    </div>
                    <div 
                        style={{ ...styles.imageButton2, backgroundImage: `url(${require('../assets/ImgButton2.png')})` }}
                        onClick={() => navigate('/account-billing')}
                    >
                        <div style={styles.overlay}>
                            <h3 style={styles.buttonTitle}>Billing Address</h3>
                            <p style={styles.buttonSubtitle}>Set your billing address.</p>
                        </div>
                    </div>
                </div>
                <h2 style={styles.heading}>Account Details</h2>
                <form onSubmit={handleUpdateProfile} style={styles.form}>
                    <div style={styles.formRow}>
                        <input
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="First Name"
                            style={styles.input}
                        />
                        <input
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Last Name"
                            style={styles.input}
                        />
                    </div>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email Address"
                        style={styles.input}
                    />
                </form>

                <div style={styles.buttonsContainer}>
                    <button style={styles.smallButton} onClick={handleUpdateProfile}>
                        Edit Profile
                    </button>
                    {role === "seller" ? (
                        <button style={styles.smallButton} onClick={() => navigate("/seller-dashboard")}>
                            Seller Dashboard
                        </button>
                    ) : (
                        <button style={styles.smallButton} onClick={() => setShowSellerForm(true)}>
                            Become a Seller
                        </button>
                    )}
                </div>

               

                {showSellerForm && (
                    <div style={styles.modal}>
                        <h2>Become a Seller</h2>
                        <input
                            type="text"
                            placeholder="Business Name"
                            value={businessName}
                            onChange={(e) => setBusinessName(e.target.value)}
                            style={styles.input}
                        />
                        <input
                            type="text"
                            placeholder="Product Type"
                            value={productType}
                            onChange={(e) => setProductType(e.target.value)}
                            style={styles.input}
                        />
                        <textarea
                            placeholder="Description of Products"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            style={styles.textarea}
                        />
                        <button onClick={handleBecomeSeller} style={styles.submitButton}>
                            Submit
                        </button>
                        <button onClick={() => setShowSellerForm(false)} style={styles.closeButton}>
                            Cancel
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const styles = {
  container: {
        display: "flex",
        padding: "50px",
        maxWidth: "1400px",
        margin: "0 auto",
        marginTop: "100px",
        height: "100vh",
    },
    mainContent: {
        flex: 1,
        paddingLeft: "40px",
    },
    heading: {
        fontSize: "2.5rem",
        marginBottom: "20px",
        color: "#333",
        borderBottom: "2px solid #e74c3c",
        paddingBottom: "10px",
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "20px",
    },
    formRow: {
        display: "flex",
        gap: "20px",
    },
    buttonsContainer: {
        display: "flex",
        gap: "10px",
        marginBottom: "20px",
    },
    smallButton: {
        padding: "8px 16px",
        fontSize: "0.9rem",
        backgroundColor: "#4285F4",
        color: "#fff",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
    },
    imageButtons: {
        display: "flex",
        gap: "20px",
        marginBottom: "30px",
        justifyContent: "space-between",
    },
    imageButton: {
        width: "48%",
        height: "250px",
        backgroundColor: 'rgb(53,140,156)',
        backgroundSize: "cover",
        backgroundPosition: "center",
        borderRadius: "12px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
    },
    imageButton2: {
        width: "48%",
        height: "250px",
        backgroundColor: 'rgb(246,135,30)',
        backgroundSize: "cover",
        backgroundPosition: "center",
        borderRadius: "12px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
    },
    overlay: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        color: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "20px",
    },
    buttonTitle: {
        fontSize: "2.5rem",
        fontWeight: "bold",
    },
    buttonSubtitle: {
        fontSize: "1rem",
    },
   modal: {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        padding: "30px",
        backgroundColor: "white",
        borderRadius: "12px",
        boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.2)",
        zIndex: 1000,
        width: "500px",
        animation: "fadeIn 0.5s ease",
    },
    modalTitle: {
        fontSize: "1.8rem",
        color: "#333",
        textAlign: "center",
        marginBottom: "20px",
    },
    formGroup: {
        display: "flex",
        alignItems: "center",
        borderRadius: "8px",
        padding: "12px",
        backgroundColor: "#f1f1f1",
        marginBottom: "15px",
        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
    },
    icon: {
        fontSize: "1.2rem",
        color: "#4285F4",
        marginRight: "10px",
    },
    input: {
        flex: 1,
        padding: "10px",
        border: "none",
        backgroundColor: "transparent",
        fontSize: "1rem",
        outline: "none",
        color: "#333",
    },
    textarea: {
        width: "100%",
        padding: "10px",
        fontSize: "1rem",
        borderRadius: "8px",
        border: "none",
        backgroundColor: "#f1f1f1",
        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
        outline: "none",
        minHeight: "80px",
        resize: "vertical",
    },
    submitButton: {
        width: "100%",
        padding: "12px",
        backgroundColor: "#28a745",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        fontSize: "1.1rem",
        fontWeight: "bold",
        cursor: "pointer",
        transition: "background-color 0.3s ease",
    },
    closeButton: {
        width: "100%",
        padding: "12px",
        backgroundColor: "#ccc",
        color: "#333",
        border: "none",
        borderRadius: "8px",
        fontSize: "1.1rem",
        fontWeight: "bold",
        cursor: "pointer",
        marginTop: "10px",
        transition: "background-color 0.3s ease",
    },
};

export default AccountDetails;
