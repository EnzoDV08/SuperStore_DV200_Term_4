import React, { useState, useEffect } from "react";
import { auth, storage, firestore } from "../firebaseConfig";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faCog, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Sidebar = ({ profileImageURL, firstName, lastName, email }) => {
    const [hovered, setHovered] = useState(false);
    const [displayImageURL, setDisplayImageURL] = useState("https://via.placeholder.com/150");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [username, setUsername] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const user = auth.currentUser;
        if (user) {
            if (user.providerData.some((provider) => provider.providerId === "google.com") && user.photoURL) {
                setDisplayImageURL(user.photoURL);
            } else if (profileImageURL) {
                setDisplayImageURL(profileImageURL);
            }

            const fetchUsername = async () => {
                const userDoc = await getDoc(doc(firestore, "users", user.uid));
                if (userDoc.exists()) {
                    setUsername(userDoc.data().displayName || "User");
                }
            };

            fetchUsername();
        }
    }, [profileImageURL]);

    const handleSignOut = async () => {
        await signOut(auth);
        navigate("/signin");
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            await handleImageUpload(file);
        }
    };

    const handleImageUpload = async (file) => {
        const user = auth.currentUser;
        if (!user) {
            toast.error("User not authenticated");
            return;
        }

        try {
            const filePath = `profileImages/${user.uid}/${file.name}`;
            const storageRef = ref(storage, filePath);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);

            await updateDoc(doc(firestore, "users", user.uid), {
                profileImageURL: downloadURL,
                profileImagePath: filePath,
            });

            toast.success("Profile image uploaded successfully!", {
                position: "top-center",
                autoClose: 3000,
                hideProgressBar: true,
            });

            setDisplayImageURL(downloadURL);
        } catch (error) {
            console.error("Error uploading profile image:", error);
            toast.error("Failed to upload profile image. Please try again.");
        }
    };

    const handleRemoveImage = async () => {
        const user = auth.currentUser;
        if (user) {
            try {
                const userDoc = await getDoc(doc(firestore, "users", user.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    const filePath = userData.profileImagePath;

                    if (filePath) {
                        const storageRef = ref(storage, filePath);
                        await deleteObject(storageRef);

                        await updateDoc(doc(firestore, "users", user.uid), {
                            profileImageURL: "",
                            profileImagePath: "",
                        });

                        setDisplayImageURL("https://via.placeholder.com/150");
                        toast.success("Profile image removed successfully!", {
                            position: "top-center",
                            autoClose: 3000,
                            hideProgressBar: true,
                        });
                    } else {
                        toast.error("No profile image to remove.");
                    }
                } else {
                    toast.error("User document not found.");
                }
            } catch (error) {
                console.error("Error removing profile image:", error);
                toast.error("Failed to remove profile image. Please try again.");
            }
        }
    };

    const toggleDropdown = () => {
        setDropdownOpen((prev) => !prev);
    };

    return (
        <div style={styles.sidebar}>
            <ToastContainer />
            <div
                style={styles.profileImageContainer}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            >
                <img src={displayImageURL} alt="Profile" style={styles.profileImage} />
                {hovered && (
                    <div style={styles.overlay}>
                        <FontAwesomeIcon icon={faPlus} style={styles.icon} />
                        <input type="file" onChange={handleImageChange} style={styles.fileInput} />
                    </div>
                )}
            </div>
            <h3 style={styles.username}>{username}</h3>
            <h3 style={styles.name}>{firstName} {lastName}</h3>
            <p style={styles.email}>{email}</p>
            <div style={styles.divider}></div>
            <button onClick={handleSignOut} style={styles.signOutButton}>
                <FontAwesomeIcon icon={faSignOutAlt} /> Log Out
            </button>

            <button onClick={toggleDropdown} style={styles.toggleButton}>
                <FontAwesomeIcon icon={faCog} /> {dropdownOpen ? "Hide Options" : "Show Options"}
            </button>
            {dropdownOpen && (
                <div style={styles.dropdownContent}>
                    <p>Additional Settings</p>
                    <button onClick={handleRemoveImage} style={styles.signOutButton}>Remove Image</button>
                </div>
            )}
        </div>
    );
};

// Enhanced styling with animations
const styles = {
    sidebar: {
        width: "280px",
        padding: "20px",
        textAlign: "center",
        borderRadius: "20px",
        boxShadow: "0 10px 20px rgba(0, 0, 0, 0.15)",
        border: "1px solid #ddd",
        backgroundColor: "#ffffff",
        animation: "slideIn 0.6s ease-out",
        fontFamily: "Arial, sans-serif",
    },
    profileImageContainer: {
        position: "relative",
        width: "140px",
        height: "140px",
        margin: "0 auto 20px",
        overflow: "hidden",
        borderRadius: "50%",
        border: "4px solid #4285F4",
        transition: "transform 0.4s ease",
    },
    profileImage: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
        transition: "transform 0.4s",
    },
    overlay: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: 0.9,
        transition: "opacity 0.3s ease",
    },
    icon: {
        color: "#fff",
        fontSize: "2rem",
        cursor: "pointer",
    },
    fileInput: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        opacity: 0,
        cursor: "pointer",
    },
    username: {
        fontSize: "1.4rem",
        margin: "8px 0",
        fontWeight: "bold",
        color: "#333",
    },
    name: {
        fontSize: "1.1rem",
        margin: "5px 0",
        color: "#555",
    },
    email: {
        color: "#777",
        fontSize: "0.9rem",
        marginBottom: "10px",
    },
    divider: {
        width: "90%",
        height: "1px",
        backgroundColor: "#ddd",
        margin: "15px 0",
        transition: "width 0.3s ease",
    },
    signOutButton: {
        backgroundColor: "#e74c3c",
        color: "#fff",
        padding: "12px 20px",
        borderRadius: "8px",
        border: "none",
        cursor: "pointer",
        fontSize: "1rem",
        marginTop: "15px",
        transition: "background-color 0.3s ease",
    },
    toggleButton: {
        backgroundColor: "#4285F4",
        color: "#fff",
        padding: "12px 20px",
        borderRadius: "8px",
        border: "none",
        cursor: "pointer",
        fontSize: "1rem",
        marginTop: "15px",
        transition: "background-color 0.3s ease, transform 0.2s ease",
        transform: "translateY(0)",
    },
    dropdownContent: {
        backgroundColor: "#f1f1f1",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
        marginTop: "20px",
        opacity: 0.95,
    },
};

export default Sidebar;
