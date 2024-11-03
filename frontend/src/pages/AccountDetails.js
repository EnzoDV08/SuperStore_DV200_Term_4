import React, { useState, useEffect } from "react";
import { auth, firestore, storage } from "../firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AccountDetails = () => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [profileImageURL, setProfileImageURL] = useState("");
    const [profileImagePath, setProfileImagePath] = useState("");
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
                    profileImageURL,
                    profileImagePath,
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
                    <button type="submit" style={styles.button}>Edit Profile</button>
                </form>
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
        fontSize: "3rem",
        fontWeight: "bold",
        marginLeft: "-150px",
        marginBottom: "-15px",
        marginTop: "-70px",
    },
    buttonSubtitle: {
        fontSize: "1.4rem",
        marginLeft: "-240px",
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
    input: {
        padding: "15px",
        fontSize: "1.2rem",
        flex: 1,
        borderRadius: "8px",
        border: "1px solid #ccc",
    },
    button: {
        padding: "15px 30px",
        fontSize: "1.2rem",
        fontWeight: "bold",
        backgroundColor: "#e74c3c",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
    },
};

export default AccountDetails;
