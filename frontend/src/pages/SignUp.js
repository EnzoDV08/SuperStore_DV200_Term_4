// src/pages/SignUp.js

import React, { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, firestore, storage } from "../firebaseConfig";
import { setDoc, doc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Link, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";

const SignUp = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [username, setUsername] = useState("");
    const [profileImage] = useState(null); // Remove setProfileImage to fix warning
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
            let profileImageUrl = "";

            if (profileImage) {
                const imageRef = ref(storage, `profileImages/${user.uid}`);
                await uploadBytes(imageRef, profileImage);
                profileImageUrl = await getDownloadURL(imageRef);
            }

            await updateProfile(user, { displayName: username, photoURL: profileImageUrl });

            await setDoc(doc(firestore, "users", user.uid), {
                uid: user.uid,
                username,
                email,
                profileImageUrl,
                createdAt: new Date(),
            });

            navigate("/dashboard");
        } catch (error) {
            if (error.code === "auth/email-already-in-use") {
                setError("Account with this email already exists.");
            } else {
                setError("Error signing up.");
            }
            console.error("Error signing up:", error);
        }
    };

    const handleGoogleSignUp = async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            const docRef = doc(firestore, "users", user.uid);
            const docSnap = await getDoc(docRef);
            if (!docSnap.exists()) {
                await setDoc(docRef, {
                    uid: user.uid,
                    username: user.displayName,
                    email: user.email,
                    profileImageUrl: user.photoURL || "",
                    createdAt: new Date(),
                });
            }

            navigate("/dashboard");
        } catch (error) {
            setError("Google sign-up failed.");
            console.error("Error with Google sign-up:", error);
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
    };

    return (
        <div style={styles.container}>
            <h2>Sign Up</h2>
            <form style={styles.form} onSubmit={handleSignUp}>
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={styles.input}
                />
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
                <div style={styles.inputContainer}>
                    <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        style={styles.input}
                    />
                    <span
                        style={styles.icon}
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                        {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                    </span>
                </div>
                {error && <p style={styles.errorMessage}>{error}</p>}
                <button type="submit" style={styles.button}>Sign Up</button>
                <button type="button" onClick={handleGoogleSignUp} style={styles.googleButton}>Sign up with Google</button>
            </form>
            <p>
                Already have an account?{" "}
                <Link to="/signin" style={{ color: "#333", textDecoration: "underline" }}>Sign In</Link>
            </p>
        </div>
    );
};

export default SignUp;
