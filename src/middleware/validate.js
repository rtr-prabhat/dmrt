const { AppError } = require('../utils/AppError');

/**
 * Joi validation middleware factory.
 *
 * Usage:
 *   router.post('/', validate(schema), controller.create)
 *
 * Validates req.body by default.
 * Pass source='query' or source='params' for other targets.
 */
function validate(schema, source = 'body') {
  return (req, _res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly:   false,  // collect all errors, not just the first
      stripUnknown: true,   // remove fields not in schema
      convert:      true,   // coerce types (string '5' → number 5)
    });

    if (error) {
      const message = error.details.map((d) => d.message).join('; ');
      return next(new AppError(message, 422));
    }

    // Replace original payload with the validated + sanitised value
    req[source] = value;
    next();
  };
}

module.exports = validate;
