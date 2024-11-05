# 🛍️ SuperStore

Welcome to **SuperStore**, a user-driven e-commerce platform where buyers and sellers can connect seamlessly. Built with **React** and **Firebase**, this platform enables secure transactions and real-time management of orders and inventory. Sellers can manage their products, track stock, and accept orders, while customers enjoy a smooth shopping experience with order tracking capabilities.

## Table of Contents
- [Features](#-features)
- [Mockups](#-mockups)
- [Tech Stack](#-tech-stack)
- [Project Setup](#-project-setup)
- [Database Structure](#-database-structure)
- [Project Structure](#-project-structure)
- [ERD Diagram](#-erd-diagram)
- [Documentation](#-documentation)
- [Demo](#-demo)
- [Author](#-author)


## 🚀 Features

- **User Authentication:** Secure sign-up/login using Firebase with Google and email options.
- **Seller Dashboard:** Product management, stock tracking, and low-stock notifications for sellers.
- **Order Management:** Real-time order approval and inventory control.
- **Customer Shopping:** Browse products, add items to the cart, complete purchases, and track order status.

## 📸 Mockups

Check out our mockups to visualize SuperStore's interface:

- **Landing Page:** [Mockup Link](/frontend/src/assets/ScreenShot1.png)
- **Seller Dashboard:** [Mockup Link](/frontend/src/assets/ScreenShot2.png)
- **Order Summary Page:** [Mockup Link](/frontend/src/assets/ScreenShot3.png)
![SuperStore Banner](./frontend/src/assets/192.png)

## 🛠️ Tech Stack

![React Badge](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Firebase Badge](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=white)
![GitHub Badge](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)
![VS Code Badge](https://img.shields.io/badge/VS%20Code-007ACC?style=for-the-badge&logo=visual-studio-code&logoColor=white)


- **Frontend:** React
- **Backend/Database:** Firebase Firestore
- **Hosting:** Firebase
- **Version Control:** GitHub
- **Development Environment:** Visual Studio Code

Frontend: React
Backend/Database: Firebase Firestore
Hosting: Firebase
Version Control: GitHub
Development Environment: Visual Studio Code

## 🏗️ Project Setup

To run the SuperStore project on your local machine, follow these steps:

### 1. Clone the Repository


git clone https://github.com/EnzoDV08/SuperStore_DV200_Term_4.git
cd SuperStore_DV200_Term_4
2. Install Dependencies
Navigate to the frontend folder and install dependencies:


cd frontend
npm install
3. Set Up Firebase
Go to the Firebase Console.
Create a new project named "SuperStore" (or any preferred name).
Add a web app to your project and set up Firebase Hosting if you wish to deploy.
Copy the Firebase configuration and paste it into a .env file in the frontend directory.

REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-auth-domain
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-storage-bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
4. Run the Project
In the frontend folder, run the application:


npm start
The application should now be running on http://localhost:3000.

5. Deployment
To deploy the app to Firebase Hosting, use these commands:


firebase login
firebase init
firebase deploy

🔄 How SuperStore Works
User Authentication
SuperStore uses Firebase Authentication, allowing users to sign up and log in using:

Google Sign-In: Provides a quick and secure login option using Google.
Email & Password: Standard email/password-based sign-up for easy access.
Firebase Database Structure
The Firebase Firestore database for SuperStore is organized into collections for managing users, products, orders, and cart items.

📊 Database (ERD) Explanation
The SuperStore application uses Firebase Firestore as its primary database. Below is a breakdown of the main collections and their structure:

users:

Purpose: Stores all user profiles, including both buyers and sellers.
Fields:
userId: Unique identifier for each user.
name: Name of the user.
email: User’s email address.
isSeller: Boolean indicating if the user is registered as a seller.
address: A map containing the user’s address details.
createdAt: Timestamp indicating when the user account was created.
Additional fields specific to sellers, such as businessName and productType.
products:

Purpose: Contains information about each product listed on the platform.
Fields:
productId: Unique identifier for each product.
title: Name or title of the product.
description: Detailed description of the product.
price: Numeric field for the price of the product.
stock: Quantity of stock available.
sellerId: Reference to the userId of the seller who listed the product.
createdAt: Timestamp of when the product was added.
Other fields include category, discount, and imageUrl for product images.
orders:

Purpose: Manages all order data, tracking purchases made by users.
Fields:
orderId: Unique identifier for each order.
userId: Reference to the userId of the customer who placed the order.
items: Array of ordered items, with each item containing details such as productId, quantity, and price.
status: Current status of the order, e.g., "Pending," "Shipped," "Delivered."
totalPrice: Total amount charged for the order.
orderDate: Timestamp of when the order was placed.
tracking: Map containing tracking information for shipment updates.
carts:

Purpose: Contains user-specific cart items.
Fields:
userId: Unique identifier for each user’s cart.
items: Array of items in the cart, each with fields like productId, name, price, quantity, and discount.
Allows for easy retrieval and updating of cart items for each user.
Firebase Storage
In addition to Firestore, Firebase Storage is used to store images and other media files, which include:

Product Images: Each product can have one or more images associated with it, enabling a rich visual experience.
Brand Logos: Sellers can upload a logo for their brand, adding a professional touch to their product listings.

## 📂 Project Structure
The SuperStore project is organized into a structured directory to enhance maintainability, readability, and modularity. Here’s a breakdown of the main folders and their purposes:

backend/: Contains backend-related files if there is any server-side code involved.
frontend/: Houses the entire frontend project.
build/: This folder is generated when you build the project. It contains the static files ready for production deployment.
node_modules/: Stores project dependencies required by npm (Node Package Manager).
public/: Contains public files and assets, such as index.html, that are served directly without modification.
src/: This is the main source folder where the core development files are located.
assets/: Contains images, icons, and other assets used across the app.
components/: This folder is where reusable UI components are stored, such as:
Breadcrumbs.js: Displays navigational breadcrumbs.
Categories.js: Renders category filters for product selection.
Filter.js: Contains product filtering logic.
Footer.js: Renders the footer section.
LargeProductCard.js: A component to display larger product cards for detailed views.
Navbar.js: The main navigation bar for the site.
OrderManagement.js: Handles order management in the seller dashboard.
ProductCard.js: Displays individual product cards with product details.
Sidebar.js: Sidebar navigation component.
contexts/: Contains Context API files to manage global state:
AuthContext.js: Handles user authentication state across the app.
CartContext.js: Manages the shopping cart state, making it accessible across components.
pages/: Houses individual page components for each route in the application, including:
HomePage.js: Main landing page.
Dashboard.js: Seller dashboard for managing products and orders.
ProductDetails.js: Page displaying detailed product information.
OrderSummary.js: Page for viewing order summaries.
SignIn.js and SignUp.js: User authentication pages.
Other pages such as CheckoutPage.js, AccountDetails.js, Wishlist.js, and SellerDashboard.js to enhance user functionality.
App.css: Global CSS styling for the application.
App.js: The main app component where routes and providers are defined.
firebaseConfig.js: Firebase configuration file to set up Firebase services like Firestore, Authentication, and Storage.
index.css: Additional global styling.
index.js: Entry point of the React application where the app is rendered.
firebase.json: Firebase configuration file, including Firebase Hosting and Firestore settings.
firestore.rules: Security rules for Firestore to manage access control for users.
README.md: Documentation file providing an overview and guidance for the project.


📖 Documentation
Important Components
Dashboard: Main page for sellers to manage their stock and products.
ProductCard: Displays individual products with details like image, price, and discount.
OrderSummary: Provides a summary of order details and tracking information.
Key Functions
AuthContext.js: Manages user authentication across the app.
CartContext.js: Handles cart data for seamless shopping experiences.
OrderManagement.js: Core of the seller's ability to manage and approve orders.
firebaseConfig.js: Configures Firebase services including Firestore and Storage.
🌐 Demo
Check out the live demo of SuperStore https://superstore-692fb.web.app/.

## 🖊️ The Main Guy 

![Profile Image](/frontend/src/assets/WhatsApp%20Image%202024-11-05%20at%2012.27.26_02892460.jpg)  
**Enzo De Vittorio**  
[GitHub](https://github.com/EnzoDV08) | [Email](mailto:enzo.devittorio5@gmail.com) | [Number](073 662 4471)

---


Happy Shopping with SuperStore! 🎉




