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

Collections
Collection Name	Document Structure	Description
users	{userId}	Stores user profiles and details, including seller information.
products	{productId}	Contains product details, including images, price, stock, and seller information.
orders	{orderId}	Stores order information, tracking status, customer and seller data.
carts	{userId}/cartItems/{itemId}	User-specific collection for storing cart items.
Example Document Structure
users Collection
Field	Type	Description
name	String	User's name
email	String	User's email address
isSeller	Boolean	Whether the user is registered as a seller
address	Map	User's address details
createdAt	Timestamp	Date when the user account was created
products Collection
Field	Type	Description
title	String	Product title
description	String	Detailed description of the product
price	Number	Price of the product
stock	Number	Available stock quantity
sellerId	Reference	Reference to the seller's user document
createdAt	Timestamp	Date when the product was added
orders Collection
Field	Type	Description
userId	Reference	Reference to the customer's user document
items	Array	Array of ordered product items
status	String	Order status (e.g., Pending, Shipped, Delivered)
totalPrice	Number	Total price of the order
orderDate	Timestamp	Date when the order was placed
tracking	Map	Tracking information
Firebase Storage
SuperStore uses Firebase Storage to store:

Product Images: Allows sellers to upload images of products.
Brand Logos: Sellers can add a logo for their brand, which will be displayed on their products.
Images are securely stored and referenced in Firestore documents to maintain a clean structure and quick retrieval.

📂 Project Structure

SUPERSTORE_DV200_TERM_4/
├── backend/
├── frontend/
│   ├── build/
│   ├── node_modules/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── Breadcrumbs.js
│   │   │   ├── Categories.js
│   │   │   ├── Filter.js
│   │   │   ├── Footer.js
│   │   │   ├── LargeProductCard.js
│   │   │   ├── Navbar.js
│   │   │   ├── OrderManagement.js
│   │   │   ├── ProductCard.js
│   │   │   └── Sidebar.js
│   │   ├── contexts/
│   │   │   ├── AuthContext.js
│   │   │   └── CartContext.js
│   │   ├── pages/
│   │   │   ├── AccountBilling.js
│   │   │   ├── AccountDetails.js
│   │   │   ├── CheckoutPage.js
│   │   │   ├── CompareProducts.js
│   │   │   ├── Dashboard.js
│   │   │   ├── HomePage.js
│   │   │   ├── HotDeals.js
│   │   │   ├── OrderSummary.js
│   │   │   ├── OrderTracking.js
│   │   │   ├── ProductDetails.js
│   │   │   ├── ProductsPage.js
│   │   │   ├── SellerDashboard.js
│   │   │   ├── SignIn.js
│   │   │   ├── SignUp.js
│   │   │   ├── Wishlist.js
│   │   │   └── SignUpAnimations.css
│   │   ├── App.css
│   │   ├── App.js
│   │   ├── firebaseConfig.js
│   │   ├── index.css
│   │   └── index.js
├── .gitignore
├── firebase.json
├── firestore.rules
└── README.md

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

## 🖊️ Author

![Profile Image](/frontend/src/assets/WhatsApp%20Image%202024-11-05%20at%2012.27.26_02892460.jpg)  
**Enzo De Vittorio**  
[GitHub](https://github.com/EnzoDV08) | [Email](mailto:enzo.devittorio5@gmail.com) | [Number](073 662 4471)

---


Happy Shopping with SuperStore! 🎉




