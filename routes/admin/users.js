const express = require("express");
const router = express.Router();

// plugins
const _ = require("lodash");

// helpers
const cryptoHelper = require("../../helpers/crypto-helper");
const { ROLES } = require("../../helpers/roles-helper");

// middlewares
const auth = require("../../middlewares/auth");
const hasPermission = require("../../middlewares/has-permission");
const validateObjectId = require("../../middlewares/validate-object-id");
const validate = require("../../middlewares/validate");

// resources
const successResponse = require("../../resources/success-response");
const errorResponse = require("../../resources/error-response");

// models
const {
  User,
  validateUser,
  validateUserForBulkInsert,
  validateUserForEdit,
} = require("../../models/user");

// constants
const DEFAULT_PASSWORD = process.env.DEFAULT_PASSWORD;
const userAttribs =
  "itsNumber hofItsNumber namePrefix firstName lastName jamaat mobileNumber whatsappNumber";

// Index users
router.get("/", [auth, hasPermission("USERS", "READ")], async (req, res) => {
  const queryString = req.query.q || "";
  const onlyAdmins = req.query.onlyAdmins;
  const filter = {
    $and: [
      {
        $or: [
          { itsNumber: { $regex: queryString, $options: "i" } },
          { hofItsNumber: { $regex: queryString, $options: "i" } },
          { firstName: { $regex: queryString, $options: "i" } },
          { lastName: { $regex: queryString, $options: "i" } },
        ],
      },
    ],
  };

  if (onlyAdmins === "true") {
    const orCondition = [{ superAdmin: true }];

    Object.keys(ROLES).forEach((module) => {
      orCondition.push({ [`roles.${module}`]: { $exists: true, $ne: null } });
    });

    filter.$and.push({ $or: orCondition });
  }

  const users = await User.find(filter, { password: 0 }).limit(7);
  return res.send(successResponse(users));
});

// Index family members
router.get(
  "/:hofItsNumber/family",
  [auth, hasPermission("USERS", "READ")],
  async (req, res) => {
    const users = await User.find(
      { hofItsNumber: req.params.hofItsNumber },
      { password: 0 }
    );

    return res.send(successResponse(users));
  }
);

// Stats
router.get(
  "/stats",
  [auth, hasPermission("USERS", "READ")],
  async (req, res) => {
    const totalCount = await User.countDocuments();

    const hofCount = await User.countDocuments({
      $expr: { $eq: ["$itsNumber", "$hofItsNumber"] },
    });

    const guestCount = await User.countDocuments({ jamaat: "GUEST" });

    return res.send(successResponse({ totalCount, hofCount, guestCount }));
  }
);

// Add user
router.post(
  "/",
  [auth, hasPermission("USERS", "ADD")],
  validate(validateUser),
  async (req, res) => {
    let user = await User.findOne({ itsNumber: req.body.itsNumber });
    if (user)
      return res.status(400).send(errorResponse(["ITS Number already exist."]));

    user = new User(req.body);
    user.createdBy = user.updatedBy = req.user._id;
    user.password = await cryptoHelper.hash(DEFAULT_PASSWORD);

    user = await user.save();
    await User.populate(user, "createdBy");
    await User.populate(user, "updatedBy");

    return res.send(
      successResponse(
        _.omit(user.toObject(), ["password", "magicToken", "__v"])
      )
    );
  }
);

// Bulk add users
router.post(
  "/bulk",
  [auth, hasPermission("USERS", "ADD")],
  validate(validateUserForBulkInsert),
  async (req, res) => {
    let inserted = 0;

    try {
      let users = req.body || [];
      const defaultPassword = await cryptoHelper.hash(DEFAULT_PASSWORD);

      for (let x = 0; x < users.length; x++) {
        const user = users[x];
        user.createdBy = user.updatedBy = req.user._id;
        user.password = user.password
          ? await cryptoHelper.hash(user.password)
          : defaultPassword;
      }

      inserted = (await User.insertMany(users, { ordered: false })).length;
    } catch (e) {
      inserted = e.result.nInserted;
      if (e.code !== 11000) console.log(`[ERROR] While bulk insertion`, e);
    }

    return res.send(successResponse(`${inserted} new user(s) inserted.`));
  }
);

// Update user
router.put(
  "/:id",
  [
    auth,
    hasPermission("USERS", "EDIT"),
    validateObjectId(),
    validate(validateUserForEdit),
  ],
  async (req, res) => {
    const attribs = [
      "hofItsNumber",
      "jamaat",
      "password",
      "magicToken",
      "mobileNumber",
      "whatsappNumber",
      "member",
      "screenLimit",
    ];

    if (req.user.superAdmin) {
      attribs.push("roles");
      attribs.push("superAdmin");
    }

    const user = _.pick(req.body, attribs);
    user.updatedAt = Date.now();
    user.updatedBy = req.user._id;

    if (user.password) {
      user.password = await cryptoHelper.hash(user.password);
    }

    const result = await User.findOneAndUpdate({ _id: req.params.id }, user, {
      new: true,
    })
      .populate("createdBy", userAttribs)
      .populate("updatedBy", userAttribs);

    return res.send(
      successResponse(
        _.omit(result.toObject(), ["password", "magicToken", "__v"])
      )
    );
  }
);

function hasAdminAccess(user) {
  if (!user) return false;
  if (user.superAdmin) return true;
  if (!user.roles || !Object.keys(user.roles).length) return false;
  let hasAccess = false;

  Object.keys(user.roles).forEach((module) => {
    if (user.roles[module]) hasAccess = true;
  });

  return hasAccess;
}

module.exports = router;
