import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebaseConfig";
import HomePage from "./pages/HomePage";
import { CartProvider } from "./contexts/CartContext";
import CheckoutPage from "./pages/CheckoutPage";
import ProductsPage from "./pages/ProductsPage";
import HotDeals from "./pages/HotDeals";
import Dashboard from "./pages/Dashboard";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ProductDetails from "./pages/ProductDetails";
import { AuthProvider } from './contexts/AuthContext';
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
         <AuthProvider>
      <CartProvider>
            <Router>
                <Navbar user={user} />
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/products" element={<ProductsPage />} />
                    <Route path="/products/:category" element={<ProductsPage />} />
                    <Route path="/hot-deals" element={<HotDeals />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/product/:id" element={<ProductDetails />} />
                    <Route path="/signin" element={user ? <Navigate to="/dashboard" /> : <SignIn />} />
                    <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <SignUp />} />
                    <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/signin" />} />
                </Routes>
                <Footer />
            </Router>
        </CartProvider>
        </AuthProvider>
    );
}

export default App;
