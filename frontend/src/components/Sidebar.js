import React, { useState } from "react";
import { auth, storage, firestore } from "../firebaseConfig";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { doc, updateDoc, getDoc } from "firebase/firestore"; // Add getDoc import
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faMinus } from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Sidebar = ({ profileImageURL, firstName, lastName, email }) => {
    const [hovered, setHovered] = useState(false);
    const navigate = useNavigate();

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

        // Store only the file path in Firestore
        await updateDoc(doc(firestore, "users", user.uid), { profileImagePath: filePath, profileImageURL: downloadURL });

        toast.success("Profile image uploaded successfully!", {
            position: "top-center",
            autoClose: 3000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
        });

        setTimeout(() => {
            navigate(0);
        }, 1500);
    } catch (error) {
        console.error("Error uploading profile image:", error);
        toast.error("Failed to upload profile image. Please try again.");
    }
};


  const handleRemoveImage = async () => {
    const user = auth.currentUser;
    if (user) {
        try {
            // Get the user's document to retrieve the stored path
            const userDoc = await getDoc(doc(firestore, "users", user.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                const filePath = userData.profileImagePath; // Stored file path in Firestore

                if (filePath) {
                    const storageRef = ref(storage, filePath);
                    await deleteObject(storageRef);

                    // Remove the profile image URL and path from Firestore
                    await updateDoc(doc(firestore, "users", user.uid), {
                        profileImageURL: "",
                        profileImagePath: ""
                    });

                    toast.success("Profile image removed successfully!", {
                        position: "top-center",
                        autoClose: 3000,
                        hideProgressBar: true,
                    });

                    setTimeout(() => {
                        navigate(0);
                    }, 1500);
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




    return (
        <div style={styles.sidebar}>
            <ToastContainer />
            <div
                style={styles.profileImageContainer}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            >
                <img
                    src={profileImageURL || "https://via.placeholder.com/150"}
                    alt="Profile"
                    style={styles.profileImage}
                />
                {hovered && (
                    <div style={styles.overlay}>
                        <FontAwesomeIcon
                            icon={profileImageURL ? faMinus : faPlus}
                            style={styles.icon}
                            onClick={profileImageURL ? handleRemoveImage : null}
                        />
                        {!profileImageURL && (
                            <input
                                type="file"
                                onChange={handleImageChange}
                                style={styles.fileInput}
                            />
                        )}
                    </div>
                )}
            </div>
            <h3 style={styles.name}>{firstName} {lastName}</h3>
            <p style={styles.email}>{email}</p>
            <div style={styles.divider}></div>
            <button onClick={handleSignOut} style={styles.signOutButton}>Log Out</button>
        </div>
    );
};

// Styles remain unchanged
const styles = {
    sidebar: {
        width: "270px",
        padding: "30px 20px",
        textAlign: "center",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        border: "1px solid #ddd",
        backgroundColor: "#f7f7f7",
        animation: "slideIn 0.4s ease-in-out",
    },
    profileImageContainer: {
        position: "relative",
        width: "130px",
        height: "130px",
        margin: "0 auto 15px",
    },
    profileImage: {
        borderRadius: "50%",
        width: "100%",
        height: "100%",
        objectFit: "cover",
        transition: "transform 0.3s ease",
    },
    overlay: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
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
    name: {
        fontSize: "1.6rem",
        margin: "10px 0",
        fontWeight: "bold",
        color: "#333",
    },
    email: {
        color: "#666",
        fontSize: "1rem",
        marginBottom: "10px",
    },
    divider: {
        width: "80%",
        height: "1px",
        backgroundColor: "#ddd",
        margin: "10px 0",
    },
    signOutButton: {
        backgroundColor: "#e74c3c",
        color: "#fff",
        padding: "10px 20px",
        borderRadius: "6px",
        border: "none",
        cursor: "pointer",
        fontSize: "1rem",
        marginTop: "10px",
        transition: "background-color 0.3s ease",
        ":hover": {
            backgroundColor: "#c0392b",
        },
    },
};

export default Sidebar;
