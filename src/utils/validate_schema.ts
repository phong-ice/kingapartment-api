import Joi from 'joi';

export const accountSchema = Joi.object({
  username: Joi.string().required(),
  fullname: Joi.string().required(),
  //password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
  password: Joi.string().required(),
  phonenumber: Joi.string().required(),
  email: Joi.string().required(),
}).options({ allowUnknown: true });

export const apartmentSchema = Joi.object({
  name: Joi.string().required(),
  address: Joi.string().required(),
  price: Joi.string().required(),
  sqrt: Joi.string().required(),
  description: Joi.string().required(),
  priority: Joi.string().required(),
  latitude: Joi.string().required(),
  longitude: Joi.string().required(),
  photos: Joi.array().required(),
}).options({ allowUnknown: true });
