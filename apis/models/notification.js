"use strict";

let mongoose = require("mongoose")

const notification = new mongoose.Schema({

    role: { type: String, required: false, default: null },
    receiver_id: { type: mongoose.Schema.Types.ObjectId, required: true },
    message: { type: String, required: true },
    isTrigger: { type: Boolean, required: false, default: false }, // read unRead
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
const notificationSchema = new mongoose.model("notification", notification, "notification");
module.exports = notificationSchema
