// src/pages/SignUp.js

import React, { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, firestore } from "../firebaseConfig";
import { setDoc, doc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CSSTransition } from "react-transition-group";
import "./SignUpAnimations.css"; // Import animation CSS file

const productTypes = [
    "Electronics", "Fashion", "Home & Garden", "Health & Beauty", "Toys", "Sports", "Automotive", "Food & Beverage",
    "Books", "Music", "Art & Collectibles", "Jewelry & Accessories", "Office Supplies", "Software", "Tools"
];

const SignUp = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [username, setUsername] = useState("");
    const [role, setRole] = useState("buyer");
    const [businessName, setBusinessName] = useState("");
    const [productType, setProductType] = useState("");
    const [description, setDescription] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSignUp = async (e) => {
        e.preventDefault();
        setError("");
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await updateProfile(user, { displayName: username });
            const userData = {
                uid: user.uid,
                username,
                email,
                role,
                createdAt: new Date(),
            };

            if (role === "seller") {
                userData.businessName = businessName;
                userData.productType = productType;
                userData.description = description;
            }

            await setDoc(doc(firestore, "users", user.uid), userData);

            toast.success("Account created successfully!");
            navigate("/account-details");
        } catch (error) {
            setError("Error signing up.");
            console.error("Error signing up:", error);
        }
    };

    const handleGoogleSignUp = async () => {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Save Google user details to Firestore, including the profile image URL
        await setDoc(doc(firestore, "users", user.uid), {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            profileImageURL: user.photoURL, // Save Google profile image URL
            role: "buyer", // Default role for Google sign-up
            createdAt: new Date(),
        }, { merge: true });

        toast.success("Signed up with Google!");
        navigate("/account-details");
    } catch (error) {
        console.error("Error with Google sign-up:", error);
        toast.error("Error with Google sign-up.");
    }
};

    const styles = {
        container: {
            padding: "50px",
            maxWidth: "500px",
            margin: "0 auto",
            textAlign: "center",
            borderRadius: "10px",
            boxShadow: "0 8px 20px rgba(0, 0, 0, 0.2)",
            background: "white",
            animation: "fadeIn 0.5s ease-in-out",
        },
        form: {
            display: "flex",
            flexDirection: "column",
            gap: "15px",
            fontFamily: "Arial, sans-serif",
        },
        input: {
            padding: "12px",
            fontSize: "16px",
            width: "100%",
            borderRadius: "5px",
            border: "1px solid #ddd",
            transition: "border-color 0.3s",
            ":focus": { borderColor: "#4285F4" },
        },
        select: {
            padding: "12px",
            fontSize: "16px",
            width: "100%",
            borderRadius: "5px",
            border: "1px solid #ddd",
            backgroundColor: "white",
            color: "#333",
        },
        button: {
            padding: "14px",
            fontSize: "16px",
            backgroundColor: "#4285F4",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: "bold",
        },
        googleButton: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#ffffff",
            color: "#555",
            padding: "10px",
            fontSize: "16px",
            borderRadius: "5px",
            cursor: "pointer",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
            marginTop: "10px",
            transition: "transform 0.3s",
            ":hover": { transform: "scale(1.05)" },
        },
        errorMessage: {
            color: "red",
            fontSize: "0.9rem",
            marginTop: "10px",
        },
        link: {
            color: "#4285F4",
            textDecoration: "underline",
            fontWeight: "bold",
        },
        sellerFieldContainer: {
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            padding: "10px",
            backgroundColor: "#f9f9f9",
            borderRadius: "8px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        },
        sellerInput: {
            padding: "10px",
            fontSize: "15px",
            borderRadius: "5px",
            border: "1px solid #ccc",
            backgroundColor: "#fff",
            transition: "border-color 0.3s",
            ":focus": { borderColor: "#4285F4" },
        },
    };

    return (
        <div style={styles.container}>
            <ToastContainer />
            <h2>Sign Up</h2>
            <form style={styles.form} onSubmit={handleSignUp}>
                <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} style={styles.input} required />
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={styles.input} required />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={styles.input} required />
                <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={styles.input} required />
                
                <select value={role} onChange={(e) => setRole(e.target.value)} style={styles.select} required>
                    <option value="buyer">Buyer</option>
                    <option value="seller">Seller</option>
                </select>

                <CSSTransition
                    in={role === "seller"}
                    timeout={300}
                    classNames="slide"
                    unmountOnExit
                >
                    <div style={styles.sellerFieldContainer}>
                        <input
                            type="text"
                            placeholder="Business Name"
                            value={businessName}
                            onChange={(e) => setBusinessName(e.target.value)}
                            style={styles.sellerInput}
                            required={role === "seller"}
                        />
                        <select
                            value={productType}
                            onChange={(e) => setProductType(e.target.value)}
                            style={styles.sellerInput}
                            required={role === "seller"}
                        >
                            <option value="">Select Product Type</option>
                            {productTypes.map((type, index) => (
                                <option key={index} value={type}>
                                    {type}
                                </option>
                            ))}
                        </select>
                        <textarea
                            placeholder="Description of Products"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            style={{ ...styles.sellerInput, height: "80px" }}
                            required={role === "seller"}
                        />
                    </div>
                </CSSTransition>

                {error && <p style={styles.errorMessage}>{error}</p>}
                <button type="submit" style={styles.button}>Sign Up</button>
                <button type="button" onClick={handleGoogleSignUp} style={styles.googleButton}>
                    <FcGoogle size={20} style={{ marginRight: "10px" }} /> Sign up with Google
                </button>
            </form>
            <p>Already have an account? <Link to="/signin" style={styles.link}>Sign In</Link></p>
        </div>
    );
};

export default SignUp;
