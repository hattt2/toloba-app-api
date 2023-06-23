const mongoose = require("mongoose");

// plugins
const Joi = require("joi");

// constants
const EVENT_TYPES = ["youtube", "meeting", "iframe"];
const FORM_TYPES = ["airtable", "google"];

const subscriberSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    host: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const feedbackFormSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: FORM_TYPES,
      default: "airtable",
    },
    id: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const eventSchema = new mongoose.Schema({
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
  type: {
    type: String,
    required: true,
    enum: EVENT_TYPES,
    default: "youtube",
  },
  link: {
    type: String,
  },
  active: {
    type: Boolean,
    required: true,
    default: false,
  },
  public: {
    type: Boolean,
    required: true,
    default: false,
  },
  feedbackForm: {
    type: feedbackFormSchema,
  },
  subscribers: {
    type: [subscriberSchema],
    default: [],
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

const Event = mongoose.model("events", eventSchema);

function validateEvent(event) {
  const squema = {
    title: Joi.string().required().min(6).max(30),
    desc: Joi.string().max(255).allow(null, ""),
    type: Joi.string()
      .required()
      .valid(...EVENT_TYPES),
    link: Joi.string().allow(null, ""),
    active: Joi.boolean(),
    public: Joi.boolean(),
    feedbackForm: Joi.object()
      .keys({
        type: Joi.string()
          .required()
          .valid(...FORM_TYPES),
        id: Joi.string().required(),
      })
      .allow(null),
  };

  return Joi.validate(event, squema, { abortEarly: false });
}

function validateEventForEdit(event) {
  const squema = {
    title: Joi.string().min(6).max(30),
    desc: Joi.string().max(255).allow(null, ""),
    type: Joi.string().valid(...EVENT_TYPES),
    link: Joi.string().allow(null, ""),
    active: Joi.boolean(),
    public: Joi.boolean(),
    feedbackForm: Joi.object()
      .keys({
        type: Joi.string()
          .required()
          .valid(...FORM_TYPES),
        id: Joi.string().required(),
      })
      .allow(null),
  };

  return Joi.validate(event, squema, { abortEarly: false });
}

function validateItsNumbers(event) {
  const squema = Joi.array().items(Joi.string().regex(/^\d{8}$/));

  return Joi.validate(event, squema, { abortEarly: false });
}

function validateSubscriberForEdit(event) {
  const squema = { host: Joi.boolean() };

  return Joi.validate(event, squema, { abortEarly: false });
}

module.exports.Event = Event;
module.exports.EVENT_TYPES = EVENT_TYPES;
module.exports.validateEvent = validateEvent;
module.exports.validateEventForEdit = validateEventForEdit;
module.exports.validateItsNumbers = validateItsNumbers;
module.exports.validateSubscriberForEdit = validateSubscriberForEdit;
