import request from 'supertest';
import { httpStatuses } from '../src/send-status';
import { BlogViewModel } from '../src/models/blogs/blogsViewModel';
import { BlogCreateDto } from '../src/models/blogs/blogsInputModel';
import { RouterPaths } from '../src/routerPaths';
import dotenv from 'dotenv';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { appSettings } from '../src/appSettings';
import { Blog } from '../src/domain/schemas/blogs.schema';
import { createBlogFunction } from './helpers/createBlogHelper';
dotenv.config();

describe('tests for blogs', () => {
  let app: INestApplication;
  let httpServer: any;
  let moduleFixture: TestingModule;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let createdBlog1: BlogViewModel;
  let createBlog;

  beforeAll(async (): Promise<void> => {
    try {
      moduleFixture = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();
      app = moduleFixture.createNestApplication();
      appSettings(app);
      await app.init();
      httpServer = app.getHttpServer();
      createBlog = createBlogFunction(httpServer);
    } catch (error) {
      console.error('Error during module initialization:', error);
    }
  });

  afterAll(async (): Promise<void> => {
    await app.close();
  });

  const getRequest = () => {
    return request(httpServer);
  };

  it('should return 200 and blog', async () => {
    await getRequest().get(RouterPaths.blogs).expect(httpStatuses.OK_200);
  });

  it('should return 404 for not existing blog', async () => {
    await getRequest()
      .get(`${RouterPaths.blogs}/999999999999999999999999`)
      .expect(httpStatuses.NOT_FOUND_404);
  });

  it("shouldn't create a new blog without auth", async () => {
    await getRequest()
      .post(RouterPaths.blogs)
      .send({})
      .expect(httpStatuses.UNAUTHORIZED_401);

    await getRequest()
      .post(RouterPaths.blogs)
      .auth('login', 'password')
      .send({})
      .expect(httpStatuses.UNAUTHORIZED_401);
  });

  it("shouldn't create a new blog with incorrect input data", async () => {
    const data: BlogViewModel = {
      id: '',
      name: '',
      description: '',
      websiteUrl: '',
      createdAt: '',
      isMembership: false,
    };
    await getRequest()
      .post(RouterPaths.blogs)
      .send(data)
      .expect(httpStatuses.UNAUTHORIZED_401);

    await getRequest().get(RouterPaths.blogs).expect(httpStatuses.OK_200);
  });

  it('should create a new blog with correct input data', async () => {
    const countOfBlogsBefore = await Blog.countDocuments();
    expect(countOfBlogsBefore).toBe(0);
    const inputModel: BlogCreateDto = {
      name: 'new blog',
      description: 'blabla',
      websiteUrl: 'www.youtube.com',
    };

    const createResponse = await createBlog(inputModel);

    expect(createResponse.status).toBe(httpStatuses.CREATED_201);

    const createdBlog: BlogViewModel = createResponse.body;
    expect(createdBlog).toEqual({
      id: expect.any(String),
      name: inputModel.name,
      description: inputModel.description,
      websiteUrl: inputModel.websiteUrl,
      isMembership: false,
      createdAt: expect.any(String),
    });

    const countOfBlogsAfter = await Blog.countDocuments();
    expect(countOfBlogsAfter).toBe(1);

    const getByIdRes = await getRequest().get(
      `${RouterPaths.blogs}/${createdBlog.id}`,
    );

    expect(getByIdRes.status).toBe(httpStatuses.OK_200);
    expect(getByIdRes.body).toEqual(createdBlog);

    createdBlog1 = createdBlog;
    expect.setState({ blog1: createdBlog });
  });
  //let createdBlog2: BlogViewModel
  it('should create one more blog with correct input data', async () => {
    const inputModel: BlogCreateDto = {
      name: 'new blog',
      description: 'blabla',
      websiteUrl: 'www.youtube.com',
    };

    const createResponse = await createBlog(inputModel);

    expect.setState({ blog2: createResponse.body });
  });

  it('should get all posts fo specific blog', async () => {
    const { blog1 } = expect.getState();

    await getRequest()
      .get(`${RouterPaths.blogs}/${blog1.id}/posts`)
      .expect(httpStatuses.OK_200, {
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      });
  });

  it("shouldn't update a new blog with incorrect input data", async () => {
    const { blog1 } = expect.getState();

    const emptyData: BlogCreateDto = {
      name: '',
      description: '',
      websiteUrl: '',
    };

    const errors = {
      errorsMessages: expect.arrayContaining([
        { message: expect.any(String), field: 'name' },
        { message: expect.any(String), field: 'description' },
        { message: expect.any(String), field: 'websiteUrl' },
      ]),
    };

    const updateRes1 = await getRequest()
      .put(`${RouterPaths.blogs}/${blog1.id}`) // be blog1.id
      .auth('admin', 'qwerty')
      .send({});

    expect(updateRes1.status).toBe(httpStatuses.BAD_REQUEST_400);
    expect(updateRes1.body).toStrictEqual(errors);

    const updateRes2 = await getRequest()
      .put(`${RouterPaths.blogs}/${blog1.id}`) // be blog1.id
      .auth('admin', 'qwerty')
      .send(emptyData);

    expect(updateRes2.status).toBe(httpStatuses.BAD_REQUEST_400);
    expect(updateRes2.body).toStrictEqual(errors);
  });

  it("shouldn't update blog that not exist", async () => {
    const data: BlogViewModel = {
      id: '34456',
      name: 'new blog',
      description: 'blabla',
      websiteUrl: 'www.youtube.com',
      createdAt: '30.06.2014',
      isMembership: false,
    };
    await getRequest()
      .put(`${RouterPaths.blogs}/${-234}`)
      .auth('admin', 'qwerty')
      .send(data)
      .expect(httpStatuses.NOT_FOUND_404);
  });

  it('should update a new blog with correct input data', async () => {
    const { blog1 } = expect.getState();

    const inputModel: BlogCreateDto = {
      name: 'updated blog',
      description: 'upd description',
      websiteUrl: 'updwww.youtube.com',
    };

    await getRequest()
      .put(`${RouterPaths.blogs}/${blog1.id}`)
      .auth('admin', 'qwerty')
      .send(inputModel)
      .expect(httpStatuses.NO_CONTENT_204);

    const updatedBlog = await getRequest().get(
      `${RouterPaths.blogs}/${blog1.id}`,
    );

    expect(updatedBlog.status).toBe(httpStatuses.OK_200);
    expect(updatedBlog.body).not.toBe(blog1);
    expect(updatedBlog.body).toEqual({
      id: blog1.id,
      name: inputModel.name,
      description: inputModel.description,
      websiteUrl: inputModel.websiteUrl,
      isMembership: blog1.isMembership,
      createdAt: blog1.createdAt,
    });
  });

  it('should delete both blogs', async () => {
    const { blog1, blog2 } = expect.getState();

    await getRequest()
      .delete(`${RouterPaths.blogs}/${blog1.id}`)
      .auth('admin', 'qwerty')
      .expect(httpStatuses.NO_CONTENT_204);

    await getRequest()
      .get(`${RouterPaths.blogs}/${blog1.id}`)
      .expect(httpStatuses.NOT_FOUND_404);

    await getRequest()
      .delete(`${RouterPaths.blogs}/${blog2.id}`)
      .auth('admin', 'qwerty')
      .expect(httpStatuses.NO_CONTENT_204);

    await getRequest()
      .get(`${RouterPaths.blogs}/${blog2.id}`)
      .expect(httpStatuses.NOT_FOUND_404);

    await getRequest().get(RouterPaths.blogs).expect(httpStatuses.OK_200, {
      pagesCount: 0,
      page: 1,
      pageSize: 10,
      totalCount: 0,
      items: [],
    });
  });
});
