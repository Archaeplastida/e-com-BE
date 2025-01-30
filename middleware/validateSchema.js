const jsonschema = require("jsonschema");
const ExpressError = require("../expressError");

function validateSchema(schema) {
  return function (req, res, next) {
    const validator = new jsonschema.Validator();
    const validationResult = validator.validate(req.body, schema);

    // Only uncomment for debug purposes
    // console.log("--- Validation Result ---");
    // console.log("Valid:", validationResult.valid);        
    // console.log("Errors:", validationResult.errors);      
    // console.log("Request Body:", req.body);             
    // console.log("Schema:", schema);                     
    // console.log("--- End Validation Result ---");      


    if (!validationResult.valid) {
      // Simplified error message using error.message instead of error.stack
      const listOfErrors = validationResult.errors.map(error => error.message);
      const err = new ExpressError(`Validation failed: ${listOfErrors.join(", ")}`, 400);
      return next(err);
    }
    next();
  };
}

module.exports = validateSchema;