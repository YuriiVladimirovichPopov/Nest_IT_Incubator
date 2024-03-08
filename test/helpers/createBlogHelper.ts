import request from 'supertest';
import { BlogCreateDto } from '../../src/models/blogs/blogsInputModel';

export const createBlogFunction = (app: any) => {
  const createBlog = (data: BlogCreateDto) => {
    return request(app).post('/blogs').auth('admin', 'qwerty').send(data);
  };
  return createBlog;
};
