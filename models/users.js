var mongoose = require("mongoose");
var bcrypt = require("bcrypt-nodejs");

var userSchema = mongoose.Schema({
  email: String,
  password: { default: "", type: String },
  user_id: String,
  role_id: String,
  session_id: { default: "", type: String },
  academic_year_id: { default: "", type: String },
  district_id: { default: "", type: String },
  district_name: { default: "", type: String },
  standard_grade_id: { default: "", type: String },
  class_id: { default: "", type: String },
  background_image: {
    type: String,
    default: "",
  },
  logo_image: {
    type: String,
    default: "",
  },
  // school staff
  school_id: { type: String, default: "" },
  school_name: {
    type: String,
    default: "",
  },
  token: {},
  active: { type: Boolean, default: true },
  personal_info: {
    first_name: { type: String, default: "" },
    middle_name: { type: String, default: "" },
    last_name: { type: String, default: "" },
    school_name: { type: String, default: "" },
    gender: { type: String, default: "" },
    birth_date: { type: String, default: "" },
    social_security_number: { type: String, default: "" },
    permission_substitute: { type: Boolean, default: false },
    permission_sms: { type: Boolean, default: false },
    permission_notification: { type: Boolean, default: false },
    profile_image: { type: String, default: "" },
  },
  contact_info: {
    phone: { type: String, default: "" },
    office_address: { type: String, default: "" },
    office_hours: { type: String, default: "" },
    address1: { type: String, default: "" },
    address2: { type: String, default: "" },
    country: { type: String, default: "" },
    state: { type: String, default: "" },
    city: { type: String, default: "" },
    zipcode: { type: String, default: "" },
  },
  skills: { type: Array, default: [] },
  physical_info: {
    height: { type: String, default: "" },
    height_unit: { type: String, default: "feet" },
    weight: { type: String, default: "" },
    weight_unit: { type: String, default: "lbs" },
    blood: { type: String, default: "" },
    medical_immunizations: { type: Array, default: [] },
    medical_allergies: { type: Array, default: [] },
    physical_handicaps: { type: String, default: "" },
    social_behavioral: { type: String, default: "" },
    other_medical_info: { type: String, default: "" },
  },
  social_media_links: {
    facebook: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    twitter: { type: String, default: "" },
    social: { type: String, default: "" },
    notes: { type: String, default: "" },
  },
  emergency_contact: {
    full_name: { type: String, default: "" },
    mobile: { type: String, default: "" },
    address: { type: String, default: "" },
  },

  // For parents type specific fields only
  student: {
    first_name: { type: String, default: "" },
    middle_name: { type: String, default: "" },
    last_name: { type: String, default: "" },
  },
  student_id: { type: String, default: "" },
  relation_id: String,
  pickup: { type: String, default: "0" },

  // parents epecific fields ends

  created_at: Date,
  updated_at: Date,
  created_by: {},
  updated_by: {},
});

// userSchema.methods.generateHash = function (password) {
//     return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
// };

// userSchema.methods.generateToken = function () {
//     return bcrypt.hashSync(Date.now, bcrypt.genSaltSync(8), null);
// }

// userSchema.methods.validPassword = function (password) {
//     return bcrypt.compareSync(password, this.password);
// };

module.exports = mongoose.model("User", userSchema);
