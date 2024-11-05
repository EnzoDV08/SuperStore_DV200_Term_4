// src/pages/ProductDetails.js
import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { firestore, auth } from "../firebaseConfig";
import { doc, getDoc, updateDoc, setDoc, arrayUnion, deleteDoc } from "firebase/firestore";
import { FiHeart, FiShoppingCart, FiShuffle } from "react-icons/fi";
import { FaStar, FaRegStar } from "react-icons/fa";
import { CartContext } from "../contexts/CartContext";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);
  const [wishlistAdded, setWishlistAdded] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [reviews, setReviews] = useState([]);
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);

 useEffect(() => {
  const fetchProduct = async () => {
    try {
      const productRef = doc(firestore, "products", id);
      const productSnap = await getDoc(productRef);

      if (!productSnap.exists()) {
        throw new Error("Product not found");
      }
      
      const productData = productSnap.data();
      console.log("Fetched Product Data:", productData); // Debugging statement
      setProduct({ id: productSnap.id, ...productData });
      setReviews(productData.reviews || []);
    } catch (error) {
      setError(error.message);
      setTimeout(() => navigate("/products"), 3000);
    }
  };

  fetchProduct();
}, [id, navigate]);



  const handleAddToCart = async () => {
    const user = auth.currentUser;
    if (!user) {
      navigate('/signin');
      return;
    }
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      discountedPrice: product.discount ? product.price * (1 - product.discount / 100) : product.price,
      imageUrl: product.imageUrl,
      discount: product.discount || 0,
      quantity: 1,
    };
    await addToCart(cartItem);
    toast.success("Added to cart!");
  };

   const handleAddToWishlist = async () => {
    const user = auth.currentUser;
    if (!user) {
      navigate('/signin');
      return;
    }

    const wishlistRef = doc(firestore, "users", user.uid, "wishlist", product.id);
    try {
      if (wishlistAdded) {
        await deleteDoc(wishlistRef);
        setWishlistAdded(false);
        toast.info("Removed from wishlist");
      } else {
        await setDoc(wishlistRef, { ...product, addedAt: new Date() });
        setWishlistAdded(true);
        toast.success("Added to wishlist!");
      }
    } catch (error) {
      console.error("Error managing wishlist:", error);
      toast.error("Could not update wishlist");
    }
  };

   const handleSubmitReview = async () => {
    const user = auth.currentUser;
    if (!user || reviewRating === 0 || !reviewText.trim()) {
      toast.warning("Please log in and provide a rating and comment.");
      return;
    }

     const newReview = {
      userId: user.uid,
      userName: user.displayName || "Anonymous",
      userPhoto: user.photoURL || "https://via.placeholder.com/50",
      comment: reviewText,
      rating: reviewRating,
      createdAt: new Date(),
    };

    try {
      const productRef = doc(firestore, "products", id);
      await updateDoc(productRef, {
        reviews: arrayUnion(newReview),
      });
      setReviews((prevReviews) => [...prevReviews, newReview]);
      setReviewText("");
      setReviewRating(0);
      toast.success("Review submitted!");
    } catch (error) {
      console.error("Error adding review:", error);
      toast.error("Could not submit review");
    }
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    return totalRating / reviews.length;
  };

  const renderStars = (rating = 0) => {
    return [...Array(5)].map((_, i) => (
      <span key={i}>
        {i < Math.floor(rating) ? <FaStar color="#ffc107" /> : <FaRegStar color="#ccc" />}
      </span>
    ));
  };

  if (error) return <div>Error: {error}. Redirecting...</div>;
  if (!product) return <div>Loading...</div>;

const discountedPrice = product?.price && product?.discount 
    ? (product.price * (1 - product.discount / 100)).toFixed(2) 
    : product?.price;
  
  const discountAmount = product?.price && product?.discount 
    ? (product.price - discountedPrice).toFixed(2) 
    : null;


  return (
      <div style={styles.container}>
      <ToastContainer />
      <div style={styles.imageContainer}>
        {product?.stock === 0 && (
    <div style={styles.outOfStockLabel}>Out of Stock</div>
  )}
  {product?.discount > 0 && (
    <div style={styles.discountLabel}>{product.discount}% OFF</div>
  )}

        <img src={product?.imageUrl} alt={product?.name} style={styles.image} />
      </div>

      <div style={styles.infoContainer}>
        <h1 style={styles.productName}>{product?.name}</h1>
        <div style={styles.rating}>
          {renderStars(calculateAverageRating())}
          <span style={styles.reviewCount}>({reviews.length} reviews)</span>
        </div>

        <div style={styles.priceContainer}>
          {product?.price !== undefined ? (
            <>
              {product.discount > 0 ? (
                <>
                  <span style={styles.originalPrice}>R{product.price}</span>
                  <span style={styles.discountedPrice}>R{discountedPrice}</span>
                  <span style={styles.savings}>You save R{discountAmount}</span>
                </>
              ) : (
                <span style={styles.discountedPrice}>R{product.price}</span>
              )}
            </>
          ) : (
            <span style={styles.noPrice}>Price not available</span>
          )}
        </div>

        <p style={styles.description}>{product?.description}</p>


        <div style={styles.actions}>
          <button style={styles.cartButton} onClick={handleAddToCart}>
            <FiShoppingCart /> Add to Cart
          </button>
          <button
            style={{
              ...styles.wishlistButton,
              backgroundColor: wishlistAdded ? "#e63946" : "#f4f4f4"
            }}
            onClick={handleAddToWishlist}
          >
            <FiHeart /> {wishlistAdded ? "Remove from Wishlist" : "Add to Wishlist"}
          </button>
        </div>

        <div style={styles.details}>
          <p><strong>Brand:</strong> {product.brand || "N/A"}</p>
          <p><strong>SKU:</strong> {product.sku || "N/A"}</p>
          <p><strong>Status:</strong> {product.stock > 0 ? "In Stock" : "Out of Stock"}</p>
          <p><strong>Category:</strong> {product.category || "N/A"}</p>
        </div>

        <div style={styles.reviewSection}>
          <h3 style={styles.sectionHeader}>Customer Reviews</h3>
          {reviews.length > 0 ? (
            reviews.map((review, index) => (
              <div key={index} style={styles.review}>
                <div style={styles.reviewHeader}>
                  <img src={review.userPhoto} alt="User" style={styles.profileImage} />
                  <div>
                    <div style={styles.userName}>{review.userName}</div>
                    <div style={styles.reviewRating}>{renderStars(review.rating)}</div>
                  </div>
                </div>
                <p style={styles.reviewText}>{review.comment}</p>
              </div>
            ))
          ) : (
            <p style={styles.noReviews}>No reviews yet.</p>
          )}

          <h3 style={styles.sectionHeader}>Leave a Review</h3>
          <div style={styles.reviewInputContainer}>
            <div style={styles.starRating}>
              {[...Array(5)].map((_, i) => (
                <span key={i} onClick={() => setReviewRating(i + 1)} style={styles.star}>
                  {i < reviewRating ? <FaStar color="#ffc107" /> : <FaRegStar color="#ccc" />}
                </span>
              ))}
            </div>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Write your review here..."
              style={styles.textarea}
            />
            <button onClick={handleSubmitReview} style={styles.submitReviewButton}>
              Submit Review
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;

const styles = {
  container: {
    display: "flex",
    padding: "2rem",
    gap: "2rem",
    animation: "fadeIn 1s ease-in-out",
  },
  imageContainer: {
    flex: 1,
    display: "flex",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    maxWidth: "700px",
    borderRadius: "12px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  },
  infoContainer: {
    flex: 1,
    padding: "1rem",
  },
  productName: {
    fontSize: "2rem",
    fontWeight: "700",
    marginBottom: "0.5rem",
  },
  rating: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "1.2rem",
    color: "#ffc107",
    marginBottom: "1rem",
  },
  reviewCount: {
    fontSize: "0.9rem",
    color: "#666",
  },
priceContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    marginBottom: "1rem",
  },
   discountedPrice: {
    fontSize: "1.8rem",
    fontWeight: "bold",
    color: "#28a745",
  },
   originalPrice: {
    fontSize: "1.2rem",
    color: "#999",
    textDecoration: "line-through",
  },
  description: {
    fontSize: "1rem",
    color: "#666",
    lineHeight: "1.6",
    marginBottom: "1rem",
  },
  actions: {
    display: "flex",
    gap: "1rem",
    marginBottom: "1rem",
  },
  cartButton: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    backgroundColor: "#28a745",
    color: "#fff",
    padding: "0.75rem 1.5rem",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    cursor: "pointer",
  },
  wishlistButton: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    backgroundColor: "#f4f4f4",
    color: "#e63946",
    padding: "0.75rem 1.5rem",
    border: "1px solid #e63946",
    borderRadius: "8px",
    fontSize: "1rem",
    cursor: "pointer",
  },
  details: {
    marginTop: "1.5rem",
    fontSize: "1rem",
    lineHeight: "1.6",
    color: "#333",
  },
  reviewSection: {
    marginTop: "2rem",
  },
  sectionHeader: {
    fontSize: "1.4rem",
    margin: "1rem 0",
  },
  review: {
    borderBottom: "1px solid #ddd",
    paddingBottom: "1rem",
    marginBottom: "1rem",
  },
  reviewHeader: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  profileImage: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    objectFit: "cover",
  },
  userName: {
    fontWeight: "bold",
  },
  reviewRating: {
    display: "flex",
    marginBottom: "0.5rem",
  },
  reviewText: {
    fontSize: "1rem",
    color: "#333",
  },
  noReviews: {
    color: "#666",
  },
  reviewInputContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  starRating: {
    display: "flex",
  },
  star: {
    cursor: "pointer",
  },
  textarea: {
    padding: "0.5rem",
    fontSize: "1rem",
    borderRadius: "8px",
    border: "1px solid #ddd",
    resize: "none",
  },
  submitReviewButton: {
    backgroundColor: "#28a745",
    color: "#fff",
    padding: "0.75rem",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
  },
   discountLabel: {
    position: "absolute",
    top: "10px",
    left: "10px",
    backgroundColor: "#ff6f61",
    color: "#fff",
    padding: "0.3rem 0.6rem",
    borderRadius: "5px",
    fontSize: "0.9rem",
    fontWeight: "bold",
  },
   savings: {
    fontSize: "1rem",
    color: "#ff6f61",
    fontWeight: "bold",
  },
   noPrice: { color: "#999" },
   outOfStockLabel: {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  backgroundColor: "rgba(255, 0, 0, 0.85)", // Bold red with slight transparency
  color: "#fff",
  padding: "20px 40px",
  fontSize: "2rem",
  fontWeight: "bold",
  textAlign: "center",
  borderRadius: "10px",
  boxShadow: "0 4px 15px rgba(0, 0, 0, 0.3)", // Shadow for depth
  letterSpacing: "1px", // Slight letter spacing for emphasis
  zIndex: 2,
  textTransform: "uppercase", // All uppercase for stronger impact
  pointerEvents: "none", // Prevent clicks on the label
},

};
