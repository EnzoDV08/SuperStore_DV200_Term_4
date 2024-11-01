// backend/server.js

const express = require("express");
const app = express();
const PORT = process.env.PORT || 5000; // Choose any port, such as 5000

// Middleware to set COOP and COEP headers
app.use((req, res, next) => {
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
    next();
});

// Test route to verify the server is running
app.get("/", (req, res) => {
    res.send("Server is running with COOP and COEP headers!");
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
