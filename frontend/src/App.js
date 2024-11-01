// src/App.js

import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebaseConfig";
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage"; // General product page that handles categories
import HotDeals from "./pages/HotDeals"; // Import HotDeals
import Dashboard from "./pages/Dashboard";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ProductDetails from "./pages/ProductDetails";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

function App() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    return (
        <Router>
            <Navbar user={user} />
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/products/:category" element={<ProductsPage />} /> {/* Dynamic category routing */}
                <Route path="/hot-deals" element={<HotDeals />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/signin" element={user ? <Navigate to="/dashboard" /> : <SignIn />} />
                <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <SignUp />} />
                <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/signin" />} />
            </Routes>
            <Footer />
        </Router>
    );
}

export default App;
