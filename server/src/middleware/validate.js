// Validates request parts against zod schemas and exposes the parsed,
// coerced values on `req.valid` (Express 5 makes `req.query` read-only).
// Unknown body keys are stripped by zod's default object behaviour.
export const validate =
  ({ body, query, params } = {}) =>
  (req, _res, next) => {
    req.valid = {
      body: body ? body.parse(req.body ?? {}) : undefined,
      query: query ? query.parse(req.query ?? {}) : undefined,
      params: params ? params.parse(req.params ?? {}) : undefined,
    };
    next();
  };
