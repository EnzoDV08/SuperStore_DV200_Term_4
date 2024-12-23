import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, firestore } from "./firebaseConfig";
import HomePage from "./pages/HomePage";
import { CartProvider } from "./contexts/CartContext";
import CheckoutPage from "./pages/CheckoutPage";
import ProductsPage from "./pages/ProductsPage";
import HotDeals from "./pages/HotDeals";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ProductDetails from "./pages/ProductDetails";
import Wishlist from "./pages/Wishlist";
import AccountDetails from "./pages/AccountDetails";
import SellerDashboard from "./pages/SellerDashboard";
import AccountBilling from "./pages/AccountBilling";
import OrderTracking from "./pages/OrderTracking";
import { AuthProvider } from './contexts/AuthContext';
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Breadcrumb from "./components/Breadcrumbs"; 
import { doc, getDoc } from "firebase/firestore";

function App() {
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);

            if (currentUser) {
                const userDoc = await getDoc(doc(firestore, "users", currentUser.uid));
                if (userDoc.exists()) {
                    setUserRole(userDoc.data().role); 
                }
            } else {
                setUserRole(null);
            }
        });
        return () => unsubscribe();
    }, []);

    // Helper component to conditionally render Breadcrumb based on the current path
    const ConditionalBreadcrumb = () => {
        const location = useLocation();
        return location.pathname !== "/" ? <Breadcrumb /> : null;
    };

    return (
        <AuthProvider>
            <CartProvider>
                <Router>
                    <Navbar user={user} />
                    <ConditionalBreadcrumb /> 
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/products" element={<ProductsPage />} />
                        <Route path="/products/:category" element={<ProductsPage />} />
                        <Route path="/hot-deals" element={<HotDeals />} />
                        <Route path="/checkout" element={<CheckoutPage />} />
                        <Route path="/product/:id" element={<ProductDetails />} />

                        <Route 
                            path="/signin" 
                            element={
                                user ? (
                                    userRole === "seller" ? (
                                        <Navigate to="/seller-dashboard" />
                                    ) : (
                                        <Navigate to="/account-details" />
                                    )
                                ) : (
                                    <SignIn />
                                )
                            } 
                        />
                        <Route 
                            path="/signup" 
                            element={
                                user ? (
                                    userRole === "seller" ? (
                                        <Navigate to="/seller-dashboard" />
                                    ) : (
                                        <Navigate to="/account-details" />
                                    )
                                ) : (
                                    <SignUp />
                                )
                            } 
                        />
                        <Route 
                            path="/account-details" 
                            element={user ? <AccountDetails /> : <Navigate to="/signin" />} 
                        />
                        <Route 
                            path="/seller-dashboard" 
                            element={user && userRole === "seller" ? <SellerDashboard /> : <Navigate to="/signin" />} 
                        />
                        <Route 
                            path="/wishlist" 
                            element={user ? <Wishlist /> : <Navigate to="/signin" />} 
                        />
                        <Route 
                            path="/account-billing" 
                            element={user ? <AccountBilling /> : <Navigate to="/signin" />} 
                        />
                        <Route 
                            path="/order-tracking" 
                            element={user ? <OrderTracking /> : <Navigate to="/signin" />} 
                        />
                    </Routes>
                    <Footer />
                </Router>
            </CartProvider>
        </AuthProvider>
    );
}

export default App;

