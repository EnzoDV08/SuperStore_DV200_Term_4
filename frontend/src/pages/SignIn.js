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
            margin: "80px auto 0 auto", // Added top margin
            textAlign: "center",
            borderRadius: "10px",
            boxShadow: "0 8px 20px rgba(0, 0, 0, 0.2)",
            background: "white",
        },
        form: {
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "15px",
        },
        inputContainer: {
            display: "grid",
            gridTemplateColumns: "1fr auto",
        },
        input: {
            boxShadow: "inset -2px 2px 3px rgba(0, 0, 0, 0.2), inset 2px 0 3px rgba(0, 0, 0, 0.1)",
            padding: "12px",
            borderRadius: "8px",
            border: "1px solid rgba(0, 0, 0, 0.2)",
            fontSize: "16px",
            backgroundColor: "rgba(255, 255, 255, 0.2)",
        },
        icon: {
            display: "flex",
            alignItems: "center",
            padding: "8px 15px 8px 15px",
            borderRadius: "8px",
            background: 'transparent',
            cursor: "pointer",
            margin: '0px 0px 0px -3rem', // Increased negative margin to overlap mor

        },
        button: {
            padding: "12px",
            fontSize: "16px",
            backgroundColor: "#4285F4",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            margin: "0px 20% 0px 20%"
        },
        googleButton: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#ffffff",
            color: "#555",
            padding: "10px",
            fontSize: "16px",
            borderRadius: "50px",
            cursor: "pointer",
            boxShadow: "-1px 2px 3px rgba(0, 0, 0, 0.2)",
            marginTop: "10px",
            margin: "10px 20% 10px 20%",
            border: "1px solid rgba(200, 200, 200, 0.2",
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
