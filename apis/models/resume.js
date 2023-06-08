'use strict';

/*
* --------------------------------------------------------------------------
* Include required modules
* ---------------------------------------------------------------------------
*/
let mongoose = require('mongoose'),
    Schema = mongoose.Schema

/*
* --------------------------------------------------------------------------
* Define resource collection
* ---------------------------------------------------------------------------
*/

let resumeSchema = new Schema({
    name: { type: String, required: false, default: "" },
    designation: { type: String, required: false, default: "" },
    summary: { type: String, required: false, default: "" },
    skills: { type: String, required: false, default: "" },
    database: { type: String, required: false, default: "" },
}, { timestamps: true });

let experianceSchema = new Schema({
    resume_id: { type: Schema.Types.ObjectId, required: true }, // above resume id .. (One to Many)
    company_name: { type: String, required: false, default: "" },
    title: { type: String, required: false, default: "" },
    duration: { type: String, required: false, default: "" },
    technology: { type: String, required: false, default: "" },
    description: { type: String, required: false, default: "" },
}, { timestamps: true });

let projectSchema = new Schema({
    resume_id: { type: Schema.Types.ObjectId, required: true },// above resume id .. (One to Many)
    title: { type: String, required: false, default: "" },
    technology: { type: String, required: false, default: "" },
    duration: { type: String, required: false, default: "" },
    role: { type: String, required: false, default: "" },
    responsibilities: { type: String, required: false, default: "" },
    description: { type: String, required: false, default: "" },
}, { timestamps: true });

let resume = mongoose.model("resume", resumeSchema);
let resume_experiance = mongoose.model("resume_experiance", experianceSchema);
let resume_project = mongoose.model("resume_project", projectSchema);

module.exports = {
    resume: resume,
    resume_experiance: resume_experiance,
    resume_project: resume_project
}