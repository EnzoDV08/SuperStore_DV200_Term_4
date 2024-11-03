// src/pages/SignUp.js

import React, { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, firestore } from "../firebaseConfig";
import { setDoc, doc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";

const SignUp = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [username, setUsername] = useState("");
    const [role, setRole] = useState("buyer"); // New state for role selection
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
            await setDoc(doc(firestore, "users", user.uid), {
                uid: user.uid,
                username,
                email,
                role,
                createdAt: new Date(),
            });

            // Navigate based on role
            if (role === "seller") {
                navigate("/seller-dashboard");
            } else {
                navigate("/account-details");
            }
        } catch (error) {
            setError("Error signing up.");
            console.error("Error signing up:", error);
        }
    };

    return (
        <div>
            <h2>Sign Up</h2>
            <form onSubmit={handleSignUp}>
                <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                <select value={role} onChange={(e) => setRole(e.target.value)} required>
                    <option value="buyer">Buyer</option>
                    <option value="seller">Seller</option>
                </select>
                {error && <p style={{ color: "red" }}>{error}</p>}
                <button type="submit">Sign Up</button>
            </form>
            <p>Already have an account? <Link to="/signin">Sign In</Link></p>
        </div>
    );
};

export default SignUp;
