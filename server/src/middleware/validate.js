const { validationResult } = require('express-validator');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMap = {};
    errors.array().forEach((error) => {
      // Map validation errors into a field -> message structure
      const field = error.path || error.param;
      if (!errorMap[field]) {
        errorMap[field] = error.msg;
      }
    });
    return res.status(400).json({ errors: errorMap });
  }
  next();
}

module.exports = validate;
