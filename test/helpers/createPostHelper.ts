import request from 'supertest';
import { PostCreateDto } from '../../src/models/posts/postsInputModel';

export const createPostFunction = (app: any) => {
  const createPost = (data: PostCreateDto) => {
    return request(app).post('/blogs').auth('admin', 'qwerty').send(data);
  };
  return createPost;
};
