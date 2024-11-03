// src/pages/SignIn.js

import React, { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, firestore } from "../firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SignIn = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleSignIn = async (e) => {
        e.preventDefault();
        setError("");
        try {
            await signInWithEmailAndPassword(auth, email, password);
            toast.success("Signed in successfully!");
            navigate("/account-details");
        } catch (error) {
            setError("Invalid email or password.");
            console.error("Error signing in:", error);
        }
    };

    const handleGoogleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Save user data in Firestore if new
            await setDoc(doc(firestore, "users", user.uid), {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                profileImageURL: user.photoURL,
                role: "buyer", // Default role for Google Sign-In
                createdAt: new Date(),
            }, { merge: true });

            toast.success("Signed in with Google!");
            navigate("/account-details");
        } catch (error) {
            setError("Error with Google sign-in.");
            console.error("Error with Google sign-in:", error);
        }
    };

    const styles = {
        container: {
            padding: "50px",
            maxWidth: "400px",
            margin: "0 auto",
            textAlign: "center",
            borderRadius: "10px",
            boxShadow: "0 8px 20px rgba(0, 0, 0, 0.2)",
            background: "white",
        },
        form: {
            display: "flex",
            flexDirection: "column",
            gap: "15px",
        },
        inputContainer: {
            position: "relative",
        },
        input: {
            padding: "10px",
            fontSize: "16px",
            width: "100%",
            borderRadius: "5px",
            border: "1px solid #ddd",
        },
        icon: {
            position: "absolute",
            right: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            cursor: "pointer",
        },
        button: {
            padding: "12px",
            fontSize: "16px",
            backgroundColor: "#4285F4",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
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
    };

    return (
        <div style={styles.container}>
            <ToastContainer />
            <h2>Sign In</h2>
            <form style={styles.form} onSubmit={handleSignIn}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={styles.input}
                />
                <div style={styles.inputContainer}>
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={styles.input}
                    />
                    <span
                        style={styles.icon}
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                    </span>
                </div>
                {error && <p style={styles.errorMessage}>{error}</p>}
                <button type="submit" style={styles.button}>Sign In</button>
                <button type="button" onClick={handleGoogleSignIn} style={styles.googleButton}>
                    <FcGoogle size={20} style={{ marginRight: "10px" }} /> Sign in with Google
                </button>
            </form>
            <p>
                Don’t have an account? <Link to="/signup" style={styles.link}>Sign Up</Link>
            </p>
        </div>
    );
};

export default SignIn;
