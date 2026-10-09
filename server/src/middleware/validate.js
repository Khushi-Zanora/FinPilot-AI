/**
 * Zod validation middleware for Express routes.
 * Validates request body, query parameters, or route params.
 */
export function validate(schema) {
  return (req, res, next) => {
    try {
      const parsed = schema.safeParse({
        body: req.body,
        query: req.query,
        params: req.params
      });

      if (!parsed.success) {
        const errorDetails = parsed.error.issues.map((issue) => ({
          field: issue.path.slice(1).join('.'),
          message: issue.message
        }));

        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed for request parameters',
            details: errorDetails
          }
        });
      }

      // Assign parsed & sanitized data back to req
      if (parsed.data.body !== undefined) req.body = parsed.data.body;
      if (parsed.data.query !== undefined) req.query = parsed.data.query;
      if (parsed.data.params !== undefined) req.params = parsed.data.params;

      next();
    } catch (err) {
      next(err);
    }
  };
}
