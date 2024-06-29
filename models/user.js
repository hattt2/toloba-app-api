const mongoose = require("mongoose");

// plugins
const Joi = require("joi");
const jwt = require("jsonwebtoken");

// seeds
const db = require("../startup/db");

// constants
const NAME_PREFIXES = ["Mulla", "Shaikh", ""];
const GENDERS = ["Male", "Female"];

const userSchema = new mongoose.Schema({
  itsNumber: {
    type: String,
    required: true,
    unique: true,
    match: /^\d{8}$/,
    index: true,
  },
  hofItsNumber: {
    type: String,
    required: true,
    match: /^\d{8}$/,
  },
  namePrefix: {
    type: String,
    enum: NAME_PREFIXES,
  },
  firstName: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 200,
  },
  lastName: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 200,
  },
  tanzeemFileNumber: {
    type: String,
  },
  sector: {
    type: String,
  },
  subSector: {
    type: String,
  },
  building: {
    type: String,
  },
  gender: {
    type: String,
    enum: GENDERS,
  },
  age: {
    type: Number,
    minlength: 0,
    maxlength: 120,
  },
  jamaat: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50,
  },
  password: {
    type: String,
    required: true,
    minlength: 4,
    maxlength: 255,
  },
  magicToken: {
    type: String,
    required: true,
    minlength: 4,
    maxlength: 255,
  },
  mobileNumber: {
    type: String,
    match: /^\+91\d{10}$/,
  },
  whatsappNumber: {
    type: String,
    match: /^\+91\d{10}$/,
  },
  email: {
    type: String,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please fill a valid email address",
    ],
  },
  screenLimit: {
    type: Number,
    min: 1,
    max: 100,
    default: 1,
    required: true,
  },
  roles: {
    type: Object,
    default: {},
  },
  member: {
    type: Boolean,
    default: false,
  },
  superAdmin: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
});

userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      itsNumber: this.itsNumber,
      hofItsNumber: this.hofItsNumber,
      namePrefix: this.namePrefix,
      firstName: this.firstName,
      lastName: this.lastName,
      whatsappNumber: this.whatsappNumber,
      mobileNumber: this.mobileNumber,
      roles: this.roles,
      superAdmin: this.superAdmin,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    },
    process.env.JWT_PRIVATE_KEY
  );
};

const User = mongoose.model("users", userSchema);

function validateUser(user) {
  const squema = {
    itsNumber: Joi.string()
      .required()
      .regex(/^\d{8}$/),
    hofItsNumber: Joi.string()
      .required()
      .regex(/^\d{8}$/),
    namePrefix: Joi.string()
      .valid(...NAME_PREFIXES)
      .allow(null, ""),
    firstName: Joi.string().required().min(3).max(200),
    lastName: Joi.string().required().min(3).max(200),
    whatsappNumber: Joi.string()
      .regex(/^\+91\d{10}$/)
      .allow(null, ""),
    mobileNumber: Joi.string().regex(/^\+91\d{10}$/),
    magicToken: Joi.string().min(4).max(255),
    tanzeemFileNumber: Joi.string().allow(null, ""),
    sector: Joi.string().allow(null, ""),
    subSector: Joi.string().allow(null, ""),
    building: Joi.string().allow(null, ""),
    gender: Joi.string().valid(...GENDERS),
    age: Joi.number().min(0).max(120),
    jamaat: Joi.string().required().min(5).max(50),
    member: Joi.boolean(),
    email: Joi.string()
      .regex(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)
      .allow(null, ""),
  };

  return Joi.validate(user, squema, { abortEarly: false });
}

function validateUserForBulkInsert(users) {
  const squema = Joi.array().items({
    itsNumber: Joi.string()
      .required()
      .regex(/^\d{8}$/),
    hofItsNumber: Joi.string()
      .required()
      .regex(/^\d{8}$/),
    namePrefix: Joi.string()
      .valid(...NAME_PREFIXES)
      .allow(null, ""),
    firstName: Joi.string().required().min(3).max(200),
    lastName: Joi.string().required().min(3).max(200),
    whatsappNumber: Joi.string()
      .regex(/^\+91\d{10}$/)
      .allow(null, ""),
    mobileNumber: Joi.string().regex(/^\+91\d{10}$/),
    tanzeemFileNumber: Joi.string().allow(null, ""),
    sector: Joi.string().allow(null, ""),
    subSector: Joi.string().allow(null, ""),
    building: Joi.string().allow(null, ""),
    gender: Joi.string().valid(...GENDERS),
    age: Joi.number().min(0).max(120),
    jamaat: Joi.string().required().min(5).max(50),
    password: Joi.string().min(4).max(8),
    member: Joi.boolean(),
    email: Joi.string()
      .regex(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)
      .allow(null, ""),
  });

  return Joi.validate(users, squema, { abortEarly: false });
}

function validateUserForEdit(user) {
  const squema = {
    screenLimit: Joi.number().min(1).max(100),
    jamaat: Joi.string().min(5).max(50),
    namePrefix: Joi.string()
      .valid(...NAME_PREFIXES)
      .allow(null, ""),
    firstName: Joi.string().min(3).max(200),
    lastName: Joi.string().min(3).max(200),
    whatsappNumber: Joi.string()
      .regex(/^\+91\d{10}$/)
      .allow(null, ""),
    mobileNumber: Joi.string().regex(/^\+91\d{10}$/),
    password: Joi.string().min(4).max(8),
    magicToken: Joi.string().min(4).max(255),
    roles: Joi.object(),
    superAdmin: Joi.boolean(),
    tanzeemFileNumber: Joi.string().allow(null, ""),
    sector: Joi.string().min(3).max(200).allow(null, ""),
    subSector: Joi.string().min(3).max(200).allow(null, ""),
    building: Joi.string().min(3).max(200).allow(null, ""),
    gender: Joi.string().valid(...GENDERS),
    age: Joi.number().min(0).max(120),
    member: Joi.boolean(),
    email: Joi.string()
      .regex(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)
      .allow(null, ""),
  };

  return Joi.validate(user, squema, { abortEarly: false });
}

async function findUserById(id, includePassword = false) {
  try {
    if (includePassword) {
      return await User.findById(id);
    }

    return await User.findById(id).select("-password -__v -magicToken");
  } catch (error) {
    console.log(error.message);
    return null;
  }
}

module.exports.User = User;
module.exports.validateUser = validateUser;
module.exports.validateUserForBulkInsert = validateUserForBulkInsert;
module.exports.validateUserForEdit = validateUserForEdit;
module.exports.findUserById = findUserById;
