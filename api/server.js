const { app } = require("../packages/backend/dist/server.js");

module.exports = (req, res) => {
  app(req, res);
};
