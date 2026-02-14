import Joi from 'joi';
import DOMPurify from 'isomorphic-dompurify';

// Sanitize string input
const sanitize = (value) => {
  if (typeof value !== 'string') return value;
  return DOMPurify.sanitize(value, { ALLOWED_TAGS: [] });
};

// Poll creation validation schema
export const createPollSchema = Joi.object({
  question: Joi.string()
    .min(10)
    .max(200)
    .trim()
    .custom((value, helpers) => sanitize(value))
    .required()
    .messages({
      'string.min': 'Question must be at least 10 characters',
      'string.max': 'Question cannot exceed 200 characters',
      'any.required': 'Question is required'
    }),
  
  options: Joi.array()
    .items(
      Joi.string()
        .min(1)
        .max(100)
        .trim()
        .custom((value, helpers) => sanitize(value))
        .required()
    )
    .min(2)
    .max(10)
    .required()
    .messages({
      'array.min': 'Poll must have at least 2 options',
      'array.max': 'Poll cannot have more than 10 options',
      'any.required': 'Options are required'
    })
});

// Vote submission validation schema
export const voteSchema = Joi.object({
  pollId: Joi.string()
    .pattern(/^[a-zA-Z0-9_-]{7,12}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid poll ID format',
      'any.required': 'Poll ID is required'
    }),
  
  optionId: Joi.string()
    .required()
    .messages({
      'any.required': 'Option selection is required'
    }),
  
  fingerprint: Joi.string()
    .pattern(/^[a-f0-9]{64}$/i)
    .required()
    .messages({
      'string.pattern.base': 'Invalid fingerprint format',
      'any.required': 'Device fingerprint is required'
    })
});

// Validation middleware factory
export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      console.log('Validation error:', JSON.stringify({
        body: req.body,
        errors: error.details.map(d => ({ field: d.path.join('.'), message: d.message, value: d.context?.value }))
      }));
      
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: errors
        }
      });
    }

    req.validatedData = value;
    next();
  };
};
