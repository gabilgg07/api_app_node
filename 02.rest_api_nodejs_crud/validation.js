import Joi from "joi";

export const registerValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().alphanum().min(3).max(100).required(),
    email: Joi.string().min(6).max(255).required().email(),
    password: Joi.string().min(6).required(),
    repeat_password: Joi.ref("password"),
  });

  return schema.validate(data);
};
export const loginValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().min(6).max(255).required().email(),
    password: Joi.string().min(6).required(),
  });

  return schema.validate(data);
};
