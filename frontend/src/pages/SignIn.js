// src/pages/SignIn.js

import React, { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { Link, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";

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
            navigate("/dashboard");
        } catch (error) {
            setError("Invalid email or password.");
            console.error("Error signing in:", error);
        }
    };

    const handleGoogleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            navigate("/dashboard");
        } catch (error) {
            if (error.code === 'auth/popup-closed-by-user') {
                setError("Popup closed before completing sign-in. Please try again.");
            } else {
                setError("Error with Google sign-in.");
            }
            console.error("Error with Google sign-in:", error);
        }
    };

    const styles = {
        container: {
            padding: "40px",
            maxWidth: "400px",
            margin: "0 auto",
            textAlign: "center",
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
            padding: "10px",
            fontSize: "16px",
            backgroundColor: "#333",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
        },
        googleButton: {
            backgroundColor: "#4285F4",
            color: "white",
            padding: "10px",
            fontSize: "16px",
            borderRadius: "5px",
            cursor: "pointer",
            marginTop: "10px",
        },
        errorMessage: {
            color: "red",
            fontSize: "0.9rem",
            marginTop: "10px",
        },
        link: {
            color: "#333",
            textDecoration: "underline",
        },
    };

    return (
        <div style={styles.container}>
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
                <button type="button" onClick={handleGoogleSignIn} style={styles.googleButton}>Sign in with Google</button>
            </form>
            <p>
                Don’t have an account? <Link to="/signup" style={styles.link}>Sign Up</Link>
            </p>
        </div>
    );
};

export default SignIn;
