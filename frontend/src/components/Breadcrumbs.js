// src/components/Breadcrumbs.js
import React from "react";
import { useLocation, Link } from "react-router-dom";

const Breadcrumbs = () => {
  const location = useLocation();
  const paths = location.pathname.split("/").filter((x) => x);

  const styles = {
    container: {
      margin: "1rem 0",
      fontSize: "0.9rem",
    },
    breadcrumbList: {
      display: "inline",
      listStyle: "none",
      padding: 0,
    },
    breadcrumbItem: {
      display: "inline",
      marginRight: "0.5rem",
    },
  };

  return (
    <nav style={styles.container}>
      <ul style={styles.breadcrumbList}>
        <li style={styles.breadcrumbItem}>
          <Link to="/">Home</Link> &gt;
        </li>
        {paths.map((path, index) => (
          <li key={index} style={styles.breadcrumbItem}>
            <Link to={`/${paths.slice(0, index + 1).join("/")}`}>
              {path.charAt(0).toUpperCase() + path.slice(1)}
            </Link>
            {index < paths.length - 1 && " > "}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Breadcrumbs;
