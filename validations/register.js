const Validator = require("validator");
const isEmpty = require("is-empty");

module.exports = function validateRegisterInput(data) {
  let message = {};

  data.email = !isEmpty(data.email) ? data.email : "";
  data.password = !isEmpty(data.password) ? data.password : "";

  // Email checks
  if (Validator.isEmpty(data.email)) {
    message.email = "Email field is required";
  } else if (!Validator.isEmail(data.email)) {
    message.email = "Email is invalid";
  }

  // Password checks
  if (Validator.isEmpty(data.password)) {
    message.password = "Password field is required";
  }

  if (!Validator.isLength(data.password, { min: 6, max: 30 })) {
    message.password = "Password must be at least 6 characters";
  }

  return {
    message,
    isValid: isEmpty(message),
  };
};
