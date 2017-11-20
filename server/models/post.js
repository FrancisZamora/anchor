'use strict';
const Joi = require('joi');
const AnchorModel = require('./anchor-model');

class Post extends AnchorModel {
}


Post.collection = 'posts';


Post.schema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().optional(),
  userId: Joi.string().required()
});


Post.indexes = [
  { key: { userId: 1 } }
];


module.exports = Post;
