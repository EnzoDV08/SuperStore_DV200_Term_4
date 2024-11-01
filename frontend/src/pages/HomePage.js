// src/pages/HomePage.js
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { firestore } from '../firebaseConfig';
import { collection, onSnapshot, query, limit } from 'firebase/firestore';
import ProductCard from '../components/ProductCard';
import { FaLaptop, FaMobileAlt, FaTshirt, FaBook, FaCouch, FaGamepad } from 'react-icons/fa';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTruck, faSyncAlt, faCreditCard, faHeadset } from '@fortawesome/free-solid-svg-icons';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [activeCardIndex, setActiveCardIndex] = useState(null);
  const cardsRef = useRef([]);
  const navigate = useNavigate();

  // Fetch products from Firestore
  useEffect(() => {
    const productQuery = query(collection(firestore, "products"), limit(8)); // Fetch 8 products for 2 rows
    const unsubscribe = onSnapshot(productQuery, (snapshot) => {
      const productList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productList);
    });

    return () => unsubscribe();
  }, []);

  // Intersection observer for scroll-triggered "hover" effect
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = cardsRef.current.indexOf(entry.target);
          if (entry.isIntersecting) {
            setActiveCardIndex(index);
          } else if (index === activeCardIndex) {
            setActiveCardIndex(null);
          }
        });
      },
      { threshold: 0.5 }
    );

    cardsRef.current.forEach((card) => {
      if (card) observer.observe(card);
    });

    const currentCardsRef = [...cardsRef.current];
    return () => {
      currentCardsRef.forEach((card) => {
        if (card) observer.unobserve(card);
      });
    };
  }, [activeCardIndex]);


  const styles = {
    body: {
      overflowX: 'hidden',
    },
    heroSection: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '50px 20px',
      backgroundColor: '#edd998',
      width: '100%',
      height: '644px',
      position: 'relative',
      zIndex: 2,
    },
    heroContent: {
      maxWidth: '600px',
      marginLeft: '240px',
      marginBottom: '120px',
    },
    heroHeading: {
      fontSize: '90px',
      color: '#ed8600',
      marginBottom: '10px',
      fontWeight: 'bold',
      fontFamily: 'sans-serif',
    },
    heroText: {
      fontSize: '16px',
      color: '#6f6f6f',
      marginBottom: '30px',
    },
    heroButtons: {
      display: 'flex',
      gap: '20px',
    },
    btnFestival: {
      backgroundColor: '#333333',
      color: 'white',
      padding: '15px 30px',
      borderRadius: '30px',
      fontSize: '16px',
      border: 'none',
      cursor: 'pointer',
      transition: 'transform 0.3s ease, background-color 0.3s ease',
    },
    btnFestivalHover: {
      backgroundColor: '#ed8600',
      transform: 'scale(1.1)',
      boxShadow: '0px 4px 12px rgba(237, 134, 0, 0.5)',
    },
    btnDiscover: {
      backgroundColor: 'transparent',
      color: '#333333',
      padding: '15px 30px',
      borderRadius: '30px',
      fontSize: '16px',
      border: '2px solid #333333',
      cursor: 'pointer',
      transition: 'transform 0.3s ease, background-color 0.3s ease',
    },
    btnDiscoverHover: {
      backgroundColor: '#333333',
      transform: 'scale(1.1)',
      boxShadow: '0px 4px 12px rgba(237, 134, 0, 0.3)',
       color: '#ffffffff',
    },
    heroImage: {
      maxWidth: '880px',
      borderRadius: '20px',
      position: 'relative',
      marginRight: '250px',
      marginTop: '90px',
    },
    featuresSection: {
      display: 'flex',
      height: '60px',
      justifyContent: 'space-around',
      alignItems: 'center',
      backgroundColor: 'white',
      padding: '40px 20px',
      maxWidth: '1400px',
      borderRadius: '140px',
      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
      marginTop: '-73px',
      zIndex: 5,
      width: '100%',
      transform: 'translateX(-50%)',
      position: 'relative',
      left: '50%',
    },
    featureItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
      textAlign: 'left',
      flex: 1,
      margin: '0 20px',
    },
    promotionSection: {
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      gridGap: '20px',
      margin: '50px auto',
      maxWidth: '1430px',
      marginTop: '100px',
      marginBottom: '80px',
    },
    promotionsLeft: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gridGap: '20px',
    },
  promotionCard: {
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  color: 'white',
  padding: '20px',
  borderRadius: '30px',
  position: 'relative',
  height: '250px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  transition: 'transform 0.4s ease, box-shadow 0.4s ease',
  cursor: 'pointer',
},
    largePromotionCard: {
      gridColumn: 'span 2',
      height: '300px',
    },
    largeRightPromotionCard: {
      height: '610px',
    },

    promotionCardText: {
  position: 'relative',
  zIndex: 2,
  fontSize: '32px', // Reduced size for better alignment
  fontWeight: 'bold',
  color: 'white',
  textAlign: 'left', // Align text to the left
  margin: '0', // Remove any default margin
  lineHeight: '1.2', // Adjust line height for better spacing
},

promotionCardSubtitle: {
  fontSize: '50px', // Added subtitle style
  color: 'white',
  marginTop: '5px',
   marginBottom: '50px', // Slight margin for spacing
},
shopNowButton: {
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  color: 'white',
  padding: '10px 20px',
  border: 'none',
  borderRadius: '5px',
  fontSize: '14px',
  cursor: 'pointer',
  position: 'absolute',
  bottom: '20px',
  left: '20px',
  zIndex: 2,
  transition: 'background-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease', // Added box-shadow transition
},

shopNowButtonHover: {
  backgroundColor: 'rgba(255, 255, 255, 0.9)', // Change background on hover
  color: '#000', // Change text color on hover
  transform: 'scale(1.1)', // Scale up button on hover
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)', // Add shadow for depth
},

promotionCardHover: {
  transform: 'scale(1.05)', // Scale up on hover
  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)', // Increase shadow
},


    categorySection: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '50px 0',
      maxWidth: '1340px',
      margin: '0 auto',
      flexWrap: 'nowrap',
    },
 categoryCard: {
  borderStyle: 'solid',
  borderColor: '#ee8600',
  borderWidth: '2px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  width: '160px',
  height: '220px',
  padding: '20px',
  backgroundColor: '#f9f9f9',
  borderRadius: '10px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease',
  margin: '0 10px',
  cursor: 'pointer',
  position: 'relative',
  overflow: 'hidden',
  color: '#ee8600' // Prevent overflow on hover
},

categoryCardHover: {
  transform: 'scale(1.05)', // Slightly enlarge on hover
  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)', // Increase shadow
},

categoryIcon: {
  transition: 'transform 0.3s ease',
  color: '#ee8600', // Smooth transition for icon flip
},
categoryIconHover: {
  transform: 'rotateY(180deg)', // Flip icon on hover
},
    categoryTitle: {
      fontSize: '16px',
      fontWeight: 'bold',
      marginTop: '10px',
      color: '#333',
      textAlign: 'center',
    },
    topProductsSection: {
      textAlign: 'center',
      marginTop: '70px',
      maxWidth: '1300px',
      margin: '0 auto',
      padding: '0 40px',
      marginBottom: '100px',
    },
    productGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '30px',
      justifyContent: 'center',
      marginTop: '50px',
    },
  };

  const [hoveredButton, setHoveredButton] = useState(null);

  return (
    <div style={styles.body}>
      <section style={styles.heroSection}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroHeading}>SuperStore</h1>
          <h2 style={styles.heroSubheading}>All Products in One Place</h2>
          <p style={styles.heroText}>
            Discover a wide range of products, from electronics to clothing,
            home essentials to entertainment. Your one-stop shop for everything!
          </p>
          <div style={styles.heroButtons}>
            <button
              style={{
                ...styles.btnFestival,
                ...(hoveredButton === 'festival' ? styles.btnFestivalHover : {})
              }}
              onMouseEnter={() => setHoveredButton('festival')}
              onMouseLeave={() => setHoveredButton(null)}
              onClick={() => navigate("/HotDeals")}
            >
              Hot Deals
            </button>
                    <button
          style={{
            ...styles.btnDiscover,
            ...(hoveredButton === 'discover' ? styles.btnDiscoverHover : {})
          }}
          onMouseEnter={() => setHoveredButton('discover')}
          onMouseLeave={() => setHoveredButton(null)}
          onClick={() => navigate("/products")}  // Navigate to /products route
        >
          Explore Now
        </button>

          </div>
        </div>
        <div>
          <img
            src={require('../assets/Products.png')}
            alt="Grocery Shopping"
            style={styles.heroImage}
          />
        </div>
      </section>

      <section style={styles.featuresSection}>
        <div style={styles.featureItem}>
          <FontAwesomeIcon icon={faTruck} size="4x" style={{ color: '#28a745' }} />
          <div>
            <h3>Free Shipping</h3>
            <p>On all orders over R1200</p>
          </div>
        </div>
        <div style={styles.featureItem}>
          <FontAwesomeIcon icon={faSyncAlt} size="4x" style={{ color: '#28a745' }} />
          <div>
            <h3>Return for Free</h3>
            <p>Returns are free within 3 days</p>
          </div>
        </div>
        <div style={styles.featureItem}>
          <FontAwesomeIcon icon={faCreditCard} size="4x" style={{ color: '#28a745' }} />
          <div>
            <h3>Secure Payment</h3>
            <p>Your payments are 100% safe</p>
          </div>
        </div>
        <div style={styles.featureItem}>
          <FontAwesomeIcon icon={faHeadset} size="4x" style={{ color: '#28a745' }} />
          <div>
            <h3>24/7 Support</h3>
            <p>Contact us anytime</p>
          </div>
        </div>
      </section>

     <section style={styles.promotionSection}>
  <div style={styles.promotionsLeft}>
    <div
      className="promotion-card red"
      style={{
        ...styles.promotionCard,
        backgroundImage: `url(${require('../assets/Frame1.png')})`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
      }}
      ref={(el) => (cardsRef.current[0] = el)}
    >
      <h3 style={styles.promotionCardText}>50% OFF</h3>
      <h2 style={styles.promotionCardSubtitle}>Latest Smartphones</h2> {/* New Subtitle */}
      <button
  style={styles.shopNowButton}
  onMouseEnter={(e) => {
    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
    e.currentTarget.style.color = '#000';
    e.currentTarget.style.transform = 'scale(1.1)';
    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    e.currentTarget.style.color = 'white';
    e.currentTarget.style.transform = 'scale(1)';
    e.currentTarget.style.boxShadow = 'none'; // Reset shadow
  }}
>
  Shop Now
</button>
    </div>
    <div
      className={`promotion-card light-green`}
      style={{
        ...styles.promotionCard,
        backgroundImage: `url(${require('../assets/Frame2.png')})`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
      }}
      ref={(el) => (cardsRef.current[1] = el)}
    >
      <h3 style={styles.promotionCardText}>50% OFF</h3>
      <h2 style={styles.promotionCardSubtitle}>Fashion Deals</h2> {/* New Subtitle */}
      <button
  style={styles.shopNowButton}
  onMouseEnter={(e) => {
    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
    e.currentTarget.style.color = '#000';
    e.currentTarget.style.transform = 'scale(1.1)';
    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    e.currentTarget.style.color = 'white';
    e.currentTarget.style.transform = 'scale(1)';
    e.currentTarget.style.boxShadow = 'none'; // Reset shadow
  }}
>
  Shop Now
</button>
    </div>
    <div
      className={`promotion-card dark-blue large`}
      style={{
        ...styles.promotionCard,
        ...styles.largePromotionCard,
        backgroundImage: `url(${require('../assets/Frame3.png')})`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
      }}
      ref={(el) => (cardsRef.current[2] = el)}
    >
      <h3 style={styles.promotionCardText}>30% OFF</h3>
      <h2 style={styles.promotionCardSubtitle}>Home Appliances</h2> {/* New Subtitle */}
     <button
  style={styles.shopNowButton}
  onMouseEnter={(e) => {
    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
    e.currentTarget.style.color = '#000';
    e.currentTarget.style.transform = 'scale(1.1)';
    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    e.currentTarget.style.color = 'white';
    e.currentTarget.style.transform = 'scale(1)';
    e.currentTarget.style.boxShadow = 'none'; // Reset shadow
  }}
>
  Shop Now
</button>
    </div>
  </div>
  <div
    className={`promotion-card green large-right`}
    style={{
      ...styles.promotionCard,
      ...styles.largeRightPromotionCard,
      backgroundImage: `url(${require('../assets/Frame4.png')})`,
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'scale(1.05)';
      e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.2)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'scale(1)';
      e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
    }}
    ref={(el) => (cardsRef.current[3] = el)}
  >
    <h3 style={styles.promotionCardText}>40% OFF</h3>
    <h2 style={styles.promotionCardSubtitle}>Gaming Consoles</h2> {/* New Subtitle */}
    <button
  style={styles.shopNowButton}
  onMouseEnter={(e) => {
    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
    e.currentTarget.style.color = '#000';
    e.currentTarget.style.transform = 'scale(1.1)';
    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    e.currentTarget.style.color = 'white';
    e.currentTarget.style.transform = 'scale(1)';
    e.currentTarget.style.boxShadow = 'none'; // Reset shadow
  }}
>
  Shop Now
</button>
  </div>
</section>



<div style={styles.categorySection}>
  {[
    { icon: <FaLaptop size={40} style={styles.categoryIcon} />, title: 'Electronics', path: '' },
    { icon: <FaMobileAlt size={40} style={styles.categoryIcon} />, title: 'Mobile Phones', path: '' },
    { icon: <FaTshirt size={40} style={styles.categoryIcon} />, title: 'Clothing', path: '' },
    { icon: <FaBook size={40} style={styles.categoryIcon} />, title: 'Books', path: '' },
    { icon: <FaCouch size={40} style={styles.categoryIcon} />, title: 'Furniture', path: '' },
    { icon: <FaGamepad size={40} style={styles.categoryIcon} />, title: 'Games & Consoles', path: '' },
  ].map((category, index) => (
    <div
      key={index}
      style={styles.categoryCard}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.2)';
        const icon = e.currentTarget.querySelector('svg');
        if (icon) {
          icon.style.transform = 'rotateY(180deg)'; // Flip icon
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
        const icon = e.currentTarget.querySelector('svg');
        if (icon) {
          icon.style.transform = 'rotateY(0deg)'; // Reset icon
        }
      }}
      onClick={() => navigate(category.path)} // Navigate to category products
    >
      {category.icon}
      <p style={styles.categoryTitle}>{category.title}</p>
    </div>
  ))}
</div>


      <div style={styles.topProductsSection}>
        <h2>Top Products</h2>
        <div style={styles.productGrid}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;

