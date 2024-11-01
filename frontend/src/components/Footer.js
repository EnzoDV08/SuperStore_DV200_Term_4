// src/components/Footer.js

import React from "react";
import { FiFacebook, FiTwitter, FiInstagram, FiLinkedin } from "react-icons/fi";
import { Link } from "react-router-dom";

const Footer = () => {
    const styles = {
        footer: {
            backgroundColor: "#333",
            color: "#fff",
            padding: "40px 20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            marginTop: "40px",
        },
        footerContent: {
            display: "flex",
            justifyContent: "space-between",
            maxWidth: "1200px",
            width: "100%",
            flexWrap: "wrap",
            gap: "20px",
        },
        column: {
            flex: "1",
            minWidth: "200px",
        },
        columnHeader: {
            fontSize: "1.2rem",
            marginBottom: "10px",
            fontWeight: "600",
        },
        linkList: {
            listStyleType: "none",
            padding: 0,
            lineHeight: "2",
        },
        link: {
            color: "#bbb",
            textDecoration: "none",
            fontSize: "0.9rem",
            transition: "color 0.3s",
        },
        linkHover: {
            color: "#fff",
        },
        socialIcons: {
            display: "flex",
            gap: "10px",
            fontSize: "1.2rem",
            marginTop: "10px",
        },
        copyright: {
            fontSize: "0.9rem",
            color: "#bbb",
            marginTop: "20px",
        },
    };

    return (
        <footer style={styles.footer}>
            <div style={styles.footerContent}>
                {/* About Section */}
                <div style={styles.column}>
                    <h3 style={styles.columnHeader}>About Us</h3>
                    <p style={{ color: "#bbb", fontSize: "0.9rem" }}>
                        We are dedicated to providing the best products at affordable prices. Shop with us for a seamless and enjoyable experience!
                    </p>
                </div>

                {/* Links Section */}
                <div style={styles.column}>
                    <h3 style={styles.columnHeader}>Quick Links</h3>
                    <ul style={styles.linkList}>
                        <li>
                            <Link to="/" style={styles.link}>Home</Link>
                        </li>
                        <li>
                            <Link to="/products" style={styles.link}>Products</Link>
                        </li>
                        <li>
                            <Link to="/signin" style={styles.link}>Sign In</Link>
                        </li>
                        <li>
                            <Link to="/signup" style={styles.link}>Sign Up</Link>
                        </li>
                    </ul>
                </div>

                {/* Contact Section */}
                <div style={styles.column}>
                    <h3 style={styles.columnHeader}>Contact Us</h3>
                    <p style={{ color: "#bbb", fontSize: "0.9rem" }}>Email: support@shop.com</p>
                    <p style={{ color: "#bbb", fontSize: "0.9rem" }}>Phone: +27 123 456 7890</p>
                    <div style={styles.socialIcons}>
                        <a href="https://facebook.com" style={styles.link}>
                            <FiFacebook />
                        </a>
                        <a href="https://twitter.com" style={styles.link}>
                            <FiTwitter />
                        </a>
                        <a href="https://instagram.com" style={styles.link}>
                            <FiInstagram />
                        </a>
                        <a href="https://linkedin.com" style={styles.link}>
                            <FiLinkedin />
                        </a>
                    </div>
                </div>
            </div>

            {/* Copyright */}
            <div style={styles.copyright}>
                &copy; {new Date().getFullYear()} SuperStore. All rights reserved.
            </div>
        </footer>
    );
};

export default Footer;
