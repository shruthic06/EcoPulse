// Vercel serverless entry point — imports the compiled Express app
// This file is used by vercel.json to route all requests through Express

// Set up module aliases for the workspace packages
const path = require("path");

// Load environment
process.env.NODE_ENV = process.env.NODE_ENV || "production";

// Import the compiled Express app
const { app } = require("../packages/backend/dist/server.js");

module.exports = app;
