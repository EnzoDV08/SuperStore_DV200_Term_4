// src/components/Navbar.js

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebaseConfig';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faPhone, faHeart, faUser, faSearch, faGift, faChevronDown } from '@fortawesome/free-solid-svg-icons';

const Navbar = () => {
  const [quickFindOpen, setQuickFindOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [hoveredIcon, setHoveredIcon] = useState(null);
  const [user] = useAuthState(auth);
  const [isSearchHovered, setIsSearchHovered] = useState(false);
  const [isIconHovered, setIsIconHovered] = useState(false);
  const [isLogoHovered, setIsLogoHovered] = useState(false);
  const [isDailyOffersHovered, setIsDailyOffersHovered] = useState(false);
  const [isDailyOffersActive, setIsDailyOffersActive] = useState(false);
  const [isBecomeSellerHovered, setIsBecomeSellerHovered] = useState(false);
  const [isBecomeSellerActive, setIsBecomeSellerActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCartHovered, setIsCartHovered] = useState(false);  // New state for search term
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleQuickFind = () => {
    setQuickFindOpen((prev) => !prev);
  };

const handleIconClick = (icon) => {
  if (!user) {
    navigate('/signin');
  } else if (icon === 'profile') {
    // Navigate to the dashboard with the dashboard section active
    navigate('/dashboard', { state: { section: 'dashboard' } });
  } else if (icon === 'wishlist') {
    // Navigate to the dashboard with the wishlist section active
    navigate('/dashboard', { state: { section: 'wishlist' } });
  }
};


const handleBecomeSellerClick = () => {
  if (!user) {
    navigate('/signin');
  } else {
    navigate('/dashboard', { state: { section: 'dashboard' } });
  }
};

const handleDailyOffersClick = () => {
  navigate('/products');
};


const handleSearchChange = (event) => {
    const query = event.target.value;
    setSearchTerm(query);

    if (query === "") {
        // Redirect to homepage if search is cleared
        navigate("/");
    } else {
        // Otherwise, navigate to the products page with search query
        navigate(`/products?search=${query}`);
    }
};

const handleNewProductsClick = () => {
  navigate('/products?filter=new');
};

const handleBestSalesClick = () => {
  navigate('/products?filter=best_sales');
};

const handleSpecialOffersClick = () => {
  navigate('/products?filter=special_offers');
};

  const styles = {
    navbar: {
      backgroundColor: '#0c243b',
      height: '200px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '0 20px',
      position: 'relative',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      transition: 'height 0.3s ease, opacity 0.5s ease',
      opacity: isSticky ? 0 : 1,
      zIndex: 999,
    },
    navbarContent: {
      display: 'flex',
      width: '100%',
      maxWidth: '1300px',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: '-30px',
    },
    logo: {
      display: 'flex',
      alignItems: 'center', // Center vertically within logo container
      cursor: 'pointer',
    },
    logoImg: {
      height: '90px', // Ensure this is the desired height
      marginRight: '10px',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      transform: isLogoHovered ? 'scale(1.6) rotate(-5deg)' : 'scale(1)',
    },
    logoText: {
      fontSize: '43px',
      fontWeight: 'bold',
      transition: 'color 0.3s ease, transform 0.3s ease',
      color: isLogoHovered ? '#ffffff' : '#ed8600',
      margin: 0,
      padding: 0,
      alignSelf: 'flex-end', // Aligns text at the bottom of the flex container
      lineHeight: '2',
      textDecoration: 'none', // Remove underline from the text
    },

    dividerLine: {
      height: '70px',
      width: '1px',
      backgroundColor: '#ffffff',
      marginLeft: '-20px',
    },
    rightDividerLine: {
      height: '70px', // Adjust height as needed
      width: '0.5px',
      backgroundColor: '#ffffff',
      margin: '0 10px', // Spacing around the line
    },
    searchBar: {
      display: 'flex',
      alignItems: 'center',
      maxWidth: isSearchHovered ? '450px' : '400px',
      width: '100%',
      position: 'relative',
      marginLeft: '-55px',
      transition: 'max-width 0.3s ease',
    },
    searchInput: {
      width: '100%',
      padding: '16px 50px 16px 20px',
      borderRadius: '30px',
      border: 'none',
      backgroundColor: '#3b4f6b',
      color: 'white',
      fontSize: '18px',
      transition: 'all 0.3s ease',
    },
    searchBtn: {
      height: '45px',
      width: '45px',
      position: 'absolute',
      right: '4px',
      backgroundColor: 'rgb(22, 44, 64)',
      borderRadius: '50%',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'background-color 0.3s ease, transform 0.3s ease',
      transform: isSearchHovered ? 'rotate(20deg) scale(1.1)' : 'rotate(0deg) scale(1)',
      boxShadow: isSearchHovered ? '0 0 10px rgba(237, 134, 0, 0.7)' : 'none',
    },
    searchIcon: {
      fontSize: '22px',
      transition: 'transform 0.3s ease, color 0.3s ease',
      transform: isIconHovered ? 'scale(1.3) rotate(10deg)' : 'scale(1) rotate(0deg)',
      color: isIconHovered ? '#ed8600' : '#ffffff',
    },
    navbarIcons: {
      display: 'flex',
      alignItems: 'center',
    },
    navbarItem: {
      marginLeft: '20px',
      display: 'flex',
      alignItems: 'center',
      fontSize: isSticky ? '16px' : '18px',
      color: 'white',
      cursor: 'pointer',
      transition: 'font-size 0.5s ease, color 0.3s ease, transform 0.3s ease',
      transform: 'scale(1)',
    },
    navbarItemHovered: {
      color: '#ed8600',
      transform: 'scale(1.1) rotate(-2deg)',
    },
    circleIcon: (icon) => ({
      backgroundColor: hoveredIcon === icon ? '#ed8600' : '#3b4f6b',
      padding: '12px',
      borderRadius: '50%',
      fontSize: '20px',
      color: 'white',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease',
      transform: hoveredIcon === icon ? 'scale(1.2) rotate(10deg)' : 'scale(1)',
      boxShadow: hoveredIcon === icon ? '0 0 12px rgba(237, 134, 0, 0.7)' : 'none',
    }),

cartCounter: {
  backgroundColor: '#ed8600',
  width: '24px',            // Slightly increased width
  height: '24px',
  padding: '2px',
  color: 'white',
  fontSize: '14px',
  display: 'flex',          // Added flexbox to center content
  alignItems: 'center',     // Center vertically
  justifyContent: 'center', // Center horizontally
  borderRadius: '50%',
  position: 'absolute',
  top: '-5px',
  right: '-10px',
  transition: 'background-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease',
  cursor: 'pointer',
  boxShadow: '0 0 5px rgba(0, 0, 0, 0.3)', // Added a subtle shadow for depth
},

cartCounterHover: {
  backgroundColor: '#28a745', // Darker shade on hover
  transform: 'scale(1.15) rotate(10deg)', // Slightly increase size and rotate on hover
  boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)', // Stronger shadow on hover
},


    secondNavbar: {
      backgroundColor: 'rgb(33, 62, 87)',
      height: '90px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0 20px',
      borderRadius: '50px',
      position: 'fixed',
      top: isSticky ? '20px' : '155px',
      width: '90%',
      maxWidth: '1300px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 1000,
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      transition: 'top 0.5s ease, height 0.5s ease, background-color 0.5s ease',
    },
    secondNavbarContent: {
      display: 'flex',
      gap: '20px',
      alignItems: 'center',
      whiteSpace: 'nowrap',
      fontSize: isSticky ? '18px' : '22px',
      transition: 'font-size 0.5s ease',
      marginLeft: '10px',
    },
    quickFindDropdown: {
      position: 'absolute',
      top: '100%',
      backgroundColor: 'white',
      color: '#333',
      padding: '10px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
      borderRadius: '8px',
      display: quickFindOpen ? 'block' : 'none',
      transition: 'all 0.3s ease',
    },
    hotBadge: {
      backgroundColor: '#ff6347',
      color: 'white',
      fontSize: '14px',
      fontWeight: 'bold',
      padding: '2px 10px',
      borderRadius: '20px',
      marginLeft: '10px',
    },
    secondNavbarItem: (isHovered) => ({
      color: isHovered ? '#ed8600' : 'white',
      transition: 'color 0.3s ease, transform 0.3s ease',
      transform: isHovered ? 'scale(1.1) rotate(-2deg)' : 'scale(1)',
      cursor: 'pointer',
    }),

    dailyOffers: {
      backgroundColor: '#448e9e',
      color: '#ffffff',
      padding: '8px 20px',
      fontSize: '18px',
      borderRadius: '50px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '45px',
      width: '170px',
      boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)',
      cursor: 'pointer',
      marginRight: '20px',
      transition: 'background-color 0.4s ease, transform 0.3s ease, box-shadow 0.3s ease',
    },
    dailyOffersHovered: {
      backgroundColor: '#48cbe9',
      transform: 'scale(1.15) rotate(-2deg)',
      boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.3)',
    },
    dailyOffersActive: {
      transform: 'scale(1.05) rotate(0deg)',
      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.2)',
    },
    becomeSeller: {
      backgroundColor: '#f6871e',
      color: '#fcfcfc',
      padding: '8px 20px',
      fontSize: '17px',
      borderRadius: '50px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '45px',
      width: '170px',
      boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)',
      cursor: 'pointer',
      transition: 'background-color 0.4s ease, transform 0.3s ease, box-shadow 0.3s ease',
    },
    becomeSellerHovered: {
      backgroundColor: '#f0a65a',
      transform: 'scale(1.15) rotate(2deg)',
      boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.3)',
    },
    becomeSellerActive: {
      transform: 'scale(1.05) rotate(0deg)',
      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.2)',
    },
  };

  return (
    <>
      <nav style={styles.navbar}>
        <div style={styles.navbarContent}>
          <div style={styles.logo}>
            <Link to="/" style={{ display: 'flex', alignItems: 'flex-end', textDecoration: 'none' }}>
              <img
                style={styles.logoImg}
                src={require('../assets/Logo.png')}
                alt="SuperStore Logo"
                onMouseEnter={() => setIsLogoHovered(true)}
                onMouseLeave={() => setIsLogoHovered(false)}
              />
              <span style={styles.logoText}>SuperStore</span>
            </Link>
          </div>

          <div style={styles.dividerLine}></div>
          <form
            style={styles.searchBar}
            onMouseEnter={() => setIsSearchHovered(true)}
            onMouseLeave={() => setIsSearchHovered(false)}
          >
            <input
              type="text"
              placeholder="What are you looking for?"
              value={searchTerm}
              onChange={handleSearchChange} // Trigger navigation on change
              style={styles.searchInput}
            />
            <button
              type="button" // Change to button to prevent form submission
              style={styles.searchBtn}
              onMouseEnter={() => setIsIconHovered(true)}
              onMouseLeave={() => setIsIconHovered(false)}
            >
              <FontAwesomeIcon icon={faSearch} style={styles.searchIcon} />
            </button>
          </form>
          <div style={styles.navbarIcons}>
            <span
              style={styles.navbarItem}
              onMouseEnter={() => setHoveredIcon('phone')}
              onMouseLeave={() => setHoveredIcon(null)}
            >
              <FontAwesomeIcon icon={faPhone} style={styles.circleIcon('phone')} />
              <div style={{ marginLeft: '8px' }}>
                <span>Call Center</span>
                <span style={{ display: 'block' }}>073 662 4471</span>
              </div>
            </span>

           <span
  style={{ ...styles.navbarItem, position: 'relative', marginRight: '25px' }}
  onMouseEnter={() => setHoveredIcon('cart')}
  onMouseLeave={() => setHoveredIcon(null)}
>
  <FontAwesomeIcon icon={faShoppingCart} style={styles.circleIcon('cart')} />
 <span
  style={{
    ...styles.cartCounter,
    ...(isCartHovered ? styles.cartCounterHover : {}), // Apply hover styles if hovered
  }}
  onMouseEnter={() => setIsCartHovered(true)}  // Add hover handlers for cart counter
  onMouseLeave={() => setIsCartHovered(false)}
>
  {0} {/* Replace 0 with dynamic cart count */}
</span>

</span>
            <div style={styles.rightDividerLine}></div>
            <span
              style={styles.navbarItem}
              onMouseEnter={() => setHoveredIcon('wishlist')}
              onMouseLeave={() => setHoveredIcon(null)}
              onClick={() => handleIconClick('wishlist')}
            >
              <FontAwesomeIcon icon={faHeart} style={styles.circleIcon('wishlist')} />
            </span>
            <span
  style={styles.navbarItem}
  onMouseEnter={() => setHoveredIcon('profile')}
  onMouseLeave={() => setHoveredIcon(null)}
  onClick={() => handleIconClick('profile')}
>
  <FontAwesomeIcon icon={faUser} style={styles.circleIcon('profile')} />
</span>

          </div>
        </div>
      </nav>

        <nav style={styles.secondNavbar}>
      <div style={styles.secondNavbarContent}>
        {isSticky && (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Link to="/">
              <img
                style={{ height: '70px', marginLeft: '6px', cursor: 'pointer', ...styles.logoImg }}
                src={require('../assets/Logo.png')}
                alt="SuperStore Logo"
                onMouseEnter={() => setIsLogoHovered(true)}
                onMouseLeave={() => setIsLogoHovered(false)}
              />
            </Link>
          </div>
        )}
        <span
          style={styles.secondNavbarItem(hoveredIcon === 'newProducts')}
          onMouseEnter={() => setHoveredIcon('newProducts')}
          onMouseLeave={() => setHoveredIcon(null)}
          onClick={handleNewProductsClick} // Navigate to New Products
        >
          New Products
        </span>
        <span
          style={styles.secondNavbarItem(hoveredIcon === 'bestSales')}
          onMouseEnter={() => setHoveredIcon('bestSales')}
          onMouseLeave={() => setHoveredIcon(null)}
          onClick={handleBestSalesClick} // Navigate to Best Sales
        >
          Best Sales <span style={styles.hotBadge}>HOT</span>
        </span>
        <span
          style={styles.secondNavbarItem(hoveredIcon === 'specialOffers')}
          onMouseEnter={() => setHoveredIcon('specialOffers')}
          onMouseLeave={() => setHoveredIcon(null)}
          onClick={handleSpecialOffersClick} // Navigate to Special Offers
        >
          Special Offers
        </span>

          <span
            style={styles.secondNavbarItem(hoveredIcon === 'quickFind')}
            onClick={toggleQuickFind}
            onMouseEnter={() => setHoveredIcon('quickFind')}
            onMouseLeave={() => setHoveredIcon(null)}
          >
            Quick find <FontAwesomeIcon icon={faChevronDown} />
            <div style={styles.quickFindDropdown}>
              <div>Category 1</div>
              <div>Category 2</div>
            </div>
          </span>

          <span
            style={styles.secondNavbarItem(hoveredIcon === 'contact')}
            onMouseEnter={() => setHoveredIcon('contact')}
            onMouseLeave={() => setHoveredIcon(null)}
          >
            Contact
          </span>
        </div>
        {isSticky && (
          <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span
  style={{ ...styles.navbarItem, position: 'relative', marginRight: '25px' }}
  onMouseEnter={() => setHoveredIcon('cart')}
  onMouseLeave={() => setHoveredIcon(null)}
>
  <FontAwesomeIcon icon={faShoppingCart} style={styles.circleIcon('cart')} />
 <span
  style={{
    ...styles.cartCounter,
    ...(isCartHovered ? styles.cartCounterHover : {}), 
  }}
  onMouseEnter={() => setIsCartHovered(true)}  
  onMouseLeave={() => setIsCartHovered(false)}
>
  {0} 
</span>

</span>
          </div>
        )}
        <div style={styles.navbarButtons}>
          <div
  style={{
    ...styles.dailyOffers,
    ...(isDailyOffersHovered && {
      backgroundColor: '#48cbe9',
      transform: 'scale(1.15) rotate(-2deg)',
      boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.3)',
    }),
    ...(isDailyOffersActive && {
      transform: 'scale(1.05) rotate(0deg)',
      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.2)',
    }),
  }}
  onMouseEnter={() => setIsDailyOffersHovered(true)}
  onMouseLeave={() => setIsDailyOffersHovered(false)}
  onMouseDown={() => setIsDailyOffersActive(true)}
  onMouseUp={() => setIsDailyOffersActive(false)}
  onClick={handleDailyOffersClick} // Add this onClick event
>
  <FontAwesomeIcon icon={faGift} className="icon" /> Daily Offers
</div>

          <div
  style={{
    ...styles.becomeSeller,
    ...(isBecomeSellerHovered && {
      backgroundColor: '#f0a65a',
      transform: 'scale(1.15) rotate(2deg)',
      boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.3)',
    }),
    ...(isBecomeSellerActive && {
      transform: 'scale(1.05) rotate(0deg)',
      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.2)',
    }),
  }}
  onMouseEnter={() => setIsBecomeSellerHovered(true)}
  onMouseLeave={() => setIsBecomeSellerHovered(false)}
  onMouseDown={() => setIsBecomeSellerActive(true)}
  onMouseUp={() => setIsBecomeSellerActive(false)}
  onClick={handleBecomeSellerClick} // Add this onClick event
>
  Become a Seller
</div>

        </div>
      </nav>
    </>
  );
};

export default Navbar;
