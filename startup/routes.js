const cors = require("cors");
const express = require("express");
const helmet = require("helmet");

// controllers
const auth = require("../routes/auth");
const users = require("../routes/users");
const events = require("../routes/events");
const feeds = require("../routes/feeds");
const roles = require("../routes/roles");

// admin controllers
const admin_users = require("../routes/admin/users");
const admin_events = require("../routes/admin/events");
const admin_subscribers = require("../routes/admin/subscribers");
const admin_feeds = require("../routes/admin/feeds");

// middlewares
const error = require("../middlewares/error");

module.exports = function (app) {
  app.use(
    cors({
      exposedHeaders: "x-auth-token",
    })
  );
  app.use(helmet());
  app.use(express.json());

  // User Routes
  app.use("/api/auth", auth);
  app.use("/api/users", users);
  app.use("/api/events", events);
  app.use("/api/feeds", feeds);
  app.use("/api/roles", roles);

  // Admin Routes
  app.use("/admin/users", admin_users);
  app.use("/admin/events", admin_events);
  app.use("/admin/events/:eventId/subscribers", admin_subscribers);
  app.use("/admin/feeds", admin_feeds);

  app.use(error);
};
