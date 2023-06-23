const mongoose = require("mongoose");

// plugins
const Joi = require("joi");

const actionButtonSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      minlength: 6,
      maxlength: 30,
      required: true,
    },
    link: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const feedSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    minlength: 6,
    maxlength: 30,
  },
  desc: {
    type: String,
    maxlength: 255,
  },
  hidden: {
    type: Boolean,
    required: true,
    default: false,
  },
  image: {
    type: String,
    maxlength: 255,
  },
  actionButton: {
    type: actionButtonSchema,
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

const Feed = mongoose.model("feeds", feedSchema);

function validateFeed(event) {
  const squema = {
    title: Joi.string().required().min(6).max(30),
    desc: Joi.string().max(255).allow(null, ""),
    hidden: Joi.boolean(),
    image: Joi.string().allow(null, ""),
    actionButton: Joi.object()
      .keys({
        name: Joi.string().required().min(6).max(30),
        link: Joi.string().required(),
      })
      .allow(null),
  };

  return Joi.validate(event, squema, { abortEarly: false });
}

module.exports.Feed = Feed;
module.exports.validateFeed = validateFeed;
