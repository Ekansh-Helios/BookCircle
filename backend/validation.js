import Joi from 'joi';

// Schema for creating a book
export const createBookSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  cover: Joi.string().uri().required(),
  unique_id: Joi.string().required(),
});

// Schema for updating a book
export const updateBookSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  cover: Joi.string().required(),
  unique_id: Joi.string().optional(),
});