const express = require("express");
const router = express.Router();

// middlewares
const auth = require("../../middlewares/auth");
const hasPermission = require("../../middlewares/has-permission");
const validateObjectId = require("../../middlewares/validate-object-id");
const validate = require("../../middlewares/validate");

// plugins
const _ = require("lodash");

// resources
const successResponse = require("../../resources/success-response");
const errorResponse = require("../../resources/error-response");

// models
const {
  Event,
  validateEvent,
  validateEventForEdit,
} = require("../../models/event");

// constants
const userAttribs =
  "itsNumber hofItsNumber namePrefix firstName lastName jamaat mobileNumber whatsappNumber";

// Index events
router.get("/", [auth, hasPermission("EVENTS", "READ")], async (req, res) => {
  const events = await Event.find({})
    .populate("createdBy", userAttribs)
    .populate("updatedBy", userAttribs)
    .sort({ active: -1, title: 1 });

  return res.send(successResponse(events));
});

// Add event
router.post(
  "/",
  [auth, hasPermission("EVENTS", "ADD"), validate(validateEvent)],
  async (req, res) => {
    let event = new Event(req.body);
    event.createdBy = req.user._id;
    event.updatedBy = req.user._id;
    event = await event.save();
    await Event.populate(event, "createdBy");
    await Event.populate(event, "updatedBy");
    return res.send(successResponse(event));
  }
);

// Remove event By id
router.delete(
  "/:id",
  [auth, hasPermission("EVENTS", "REMOVE"), validateObjectId()],
  async (req, res) => {
    if (!(await Event.findById(req.params.id)))
      return res.status(404).send(errorResponse(["Event Not Found."]));
    let event = await Event.findOneAndDelete({ _id: req.params.id });
    return res.send(successResponse(event));
  }
);

// Update event By id
router.put(
  "/:id",
  [
    auth,
    hasPermission("EVENTS", "EDIT"),
    validateObjectId(),
    validate(validateEventForEdit),
  ],
  async (req, res) => {
    let event = await updateEvent(req.params.id, req.body, req.user);
    return res.send(successResponse(event));
  }
);

function updateEvent(id, reqBody, user) {
  const attribs = [
    "title",
    "desc",
    "type",
    "link",
    "active",
    "public",
    "feedbackForm",
  ];

  const event = _.pick(reqBody, attribs);
  event.updatedAt = Date.now();
  event.updatedBy = user._id;

  return Event.findOneAndUpdate({ _id: id }, event, {
    new: true,
  })
    .populate("createdBy", userAttribs)
    .populate("updatedBy", userAttribs);
}

module.exports = router;
