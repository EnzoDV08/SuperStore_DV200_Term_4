// src/pages/ProductDetails.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { firestore } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import Breadcrumbs from "../components/Breadcrumbs";

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        console.log("Fetching product with ID:", id); // Debugging log

        // Fetch product data from Firestore
        const productRef = doc(firestore, "products", id);
        const productSnap = await getDoc(productRef);

        if (!productSnap.exists()) {
          throw new Error("Product not found");
        }

        setProduct({ id: productSnap.id, ...productSnap.data() });
      } catch (error) {
        setError(error.message);
        console.error("Failed to fetch product details:", error);
        setTimeout(() => navigate("/products"), 3000); // Redirect to products page if error
      }
    };

    fetchProduct();
  }, [id, navigate]);

  const styles = {
    container: {
      padding: "1rem",
      maxWidth: "600px",
      margin: "0 auto",
    },
    image: {
      width: "100%",
      borderRadius: "8px",
      marginBottom: "1rem",
    },
    name: {
      fontSize: "2rem",
      fontWeight: "bold",
      marginBottom: "0.5rem",
    },
    price: {
      fontSize: "1.5rem",
      color: "#333",
      marginBottom: "1rem",
    },
    description: {
      fontSize: "1rem",
      color: "#666",
    },
  };

  if (error) return <div>Error: {error}. Redirecting to products...</div>;
  if (!product) return <div>Loading...</div>;

  return (
    <div style={styles.container}>
      <Breadcrumbs />
      <img src={product.imageUrl} alt={product.name} style={styles.image} />
      <div style={styles.name}>{product.name}</div>
      <div style={styles.price}>${product.price.toFixed(2)}</div>
      <div style={styles.description}>{product.description}</div>
    </div>
  );
};

export default ProductDetails;
