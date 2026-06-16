/**
 * NoSQL-injection guard.
 *
 * Strips any object keys that start with "$" or contain "." from the request
 * body and params. This prevents attacks like sending
 *   { "email": { "$gt": "" }, "password": { "$gt": "" } }
 * to a login endpoint, which Mongo would otherwise treat as an operator that
 * matches any user.
 *
 * Express 5 makes req.query a read-only getter, so we don't reassign it — query
 * strings can't carry nested operator objects in the way bodies can, and all our
 * sensitive lookups (login, etc.) read from req.body.
 */
function scrub(value) {
  if (Array.isArray(value)) {
    value.forEach(scrub);
    return value;
  }
  if (value && typeof value === 'object') {
    for (const key of Object.keys(value)) {
      if (key.startsWith('$') || key.includes('.')) {
        delete value[key];
      } else {
        scrub(value[key]);
      }
    }
  }
  return value;
}

module.exports = function sanitize(req, res, next) {
  if (req.body)   scrub(req.body);
  if (req.params) scrub(req.params);
  next();
};
