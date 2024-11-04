// src/components/Breadcrumbs.js
import React from "react";
import { useLocation, Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faFolder, faChevronRight } from '@fortawesome/free-solid-svg-icons';

const Breadcrumbs = () => {
  const location = useLocation();
  const paths = location.pathname.split("/").filter((x) => x);
  const currentPathName = paths[paths.length - 1] || "Home";

  const styles = {
    container: {
      height: "3rem",
      backgroundColor: "#f0f4f8", // Soft, modern background color
      padding: "1rem 2rem",
      borderRadius: "8px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      fontSize: "1.1rem",
      boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)", // Slightly larger shadow for a modern look
    },
    leftSection: {
      display: "flex",
      alignItems: "center",
      fontWeight: "bold",
      color: "#333",
    },
    currentIcon: {
      marginRight: "0.5rem",
      color: "#3b82f6", // Blue color for the main page icon
      fontSize: "1.3rem",
    },
    currentPage: {
      fontSize: "1.2rem",
      color: "#333",
    },
    rightSection: {
      display: "flex",
      alignItems: "center",
    },
    breadcrumbList: {
      display: "flex",
      listStyle: "none",
      padding: 0,
      margin: 0,
    },
    breadcrumbItem: {
      display: "flex",
      alignItems: "center",
      color: "#0056b3", // Blue link color
      textDecoration: "none",
      fontWeight: "500",
      fontSize: "1rem",
    },
    separator: {
      margin: "0 0.5rem",
      color: "#6c757d",
    },
    homeIcon: {
      color: "#ff8c00", // Distinct orange color for the home icon
      fontSize: "1.1rem",
    },
  };

  return (
    <nav style={styles.container}>
      {/* Left Section: Current Page Icon and Name */}
      <div style={styles.leftSection}>
        <FontAwesomeIcon icon={faFolder} style={styles.currentIcon} /> {/* Current page icon */}
        <span style={styles.currentPage}>
          {currentPathName.charAt(0).toUpperCase() + currentPathName.slice(1)}
        </span>
      </div>

      {/* Right Section: Breadcrumb Path */}
      <div style={styles.rightSection}>
        <ul style={styles.breadcrumbList}>
          <li style={styles.breadcrumbItem}>
            <Link to="/" style={styles.breadcrumbItem}>
              <FontAwesomeIcon icon={faHome} style={styles.homeIcon} /> Home
            </Link>
          </li>
          {paths.map((path, index) => (
            <React.Fragment key={index}>
              <FontAwesomeIcon icon={faChevronRight} style={styles.separator} />
              <li style={styles.breadcrumbItem}>
                <Link to={`/${paths.slice(0, index + 1).join("/")}`} style={styles.breadcrumbItem}>
                  {path.charAt(0).toUpperCase() + path.slice(1)}
                </Link>
              </li>
            </React.Fragment>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Breadcrumbs;



