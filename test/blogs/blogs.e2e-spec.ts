import request from 'supertest';
import { invalidAuth, validAuth, validMongoId } from '../constants/common';
import { blogDto, createBlog, createBlogs } from '../utils/blog/blog.util';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { appSetup } from '../../src/setup/app.setup';

const PATH = '/api/blogs';

describe('BlogsController (e2e)', () => {
  let nestApp: INestApplication<App>;
  let app: App;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    nestApp = moduleFixture.createNestApplication<INestApplication<App>>();

    appSetup(nestApp);

    await nestApp.init();

    app = nestApp.getHttpServer();
  });

  afterAll(async () => {
    await nestApp!.close();
  });

  beforeEach(async () => {
    await request(app)
      .delete('/api/testing/all-data')
      .expect(HttpStatus.NO_CONTENT);
  });

  it.skip.each`
    path                  | method
    ${PATH}               | ${'post'}
    ${PATH + '/12'}       | ${'put'}
    ${PATH + '/12'}       | ${'delete'}
    ${PATH + '/12/posts'} | ${'post'}
  `(
    'should return 401 when invalid header Authorization: [$method] $path',
    async ({
      path,
      method,
    }: {
      path: string;
      method: 'post' | 'put' | 'delete';
    }) => {
      await request(app)[method](path).expect(HttpStatus.UNAUTHORIZED);
      await request(app)
        [method](path)
        .set('Authorization', invalidAuth)
        .expect(HttpStatus.UNAUTHORIZED);
    },
  );

  describe(`POST ${PATH}`, () => {
    it('should create', async () => {
      const blog = await createBlog(app, blogDto.create);

      expect(blog).toEqual({
        ...blogDto.create,
        isMembership: false,
        id: expect.any(String),
        createdAt: expect.any(String),
      });
    });
  });

  describe(`GET ${PATH}`, () => {
    it('should return [] when no blogs', async () => {
      const response = await request(app).get(PATH).expect(HttpStatus.OK);

      expect(response.body).toEqual({
        items: [],
        page: 1,
        pageSize: 10,
        pagesCount: 0,
        totalCount: 0,
      });
    });

    it('should return list of blogs', async () => {
      const [blog1, blog2] = await createBlogs(2, app);
      const response = await request(app).get(PATH).expect(HttpStatus.OK);

      expect(response.body).toEqual({
        items: [blog2, blog1],
        page: 1,
        pageSize: 10,
        pagesCount: 1,
        totalCount: 2,
      });
    });
  });

  describe(`GET ${PATH}/:id`, () => {
    it('should return 404 when no blog', async () => {
      await request(app)
        .get(`${PATH}/${validMongoId}`)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should return blog with requested id', async () => {
      const [, blog2] = await createBlogs(2, app);

      const response = await request(app)
        .get(`${PATH}/${blog2.id}`)
        .expect(HttpStatus.OK);

      expect(response.body).toEqual(blog2);
    });
  });

  describe(`PUT ${PATH}/:id`, () => {
    it('should return 404 when no blog', async () => {
      await request(app)
        .put(`${PATH}/${validMongoId}`)
        .set('Authorization', validAuth)
        .send(blogDto.update)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should return 204 when requested id exist', async () => {
      const [blog1, blog2] = await createBlogs(2, app);

      await request(app)
        .put(`${PATH}/${blog1.id}`)
        .set('Authorization', validAuth)
        .send({ ...blogDto.update, minAgeRestriction: null })
        .expect(HttpStatus.NO_CONTENT);
      await request(app)
        .put(`${PATH}/${blog2.id}`)
        .set('Authorization', validAuth)
        .send(blogDto.update)
        .expect(HttpStatus.NO_CONTENT);

      const response = await request(app)
        .get(`${PATH}/${blog2.id}`)
        .expect(HttpStatus.OK);

      expect(response.body).toMatchObject(blogDto.update);
    });
  });

  describe(`DELETE ${PATH}/:id`, () => {
    it('should return 404 when no blog', async () => {
      await request(app)
        .delete(`${PATH}/${validMongoId}`)
        .set('Authorization', validAuth)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should return 204 when requested id exist', async () => {
      const [, blog2] = await createBlogs(2, app);

      await request(app)
        .delete(`${PATH}/${blog2.id}`)
        .set('Authorization', validAuth)
        .expect(HttpStatus.NO_CONTENT);
    });
  });

  describe('Test blog-posts', () => {
    const newPost = {
      title: 'Новые возможности TypeScript',
      shortDescription: 'Обзор новых фич и улучшений в TypeScript',
      content:
        'TypeScript 5.0 представляет множество улучшений производительности и новые возможности...',
    };

    describe(`POST ${PATH}/:id/posts`, () => {
      it('should return 400 if not exist blog', async () => {
        await request(app)
          .post(`${PATH}/${validMongoId}/posts`)
          .set('Authorization', validAuth)
          .send(newPost)
          .expect(HttpStatus.NOT_FOUND);
      });

      it('should create', async () => {
        const blog = await createBlog(app);
        const response = await request(app)
          .post(`${PATH}/${blog.id}/posts`)
          .set('Authorization', validAuth)
          .send(newPost)
          .expect(HttpStatus.CREATED);

        expect(response.body).toMatchObject({
          ...newPost,
          blogId: blog.id,
          blogName: blog.name,
        });
      });
    });

    describe(`GET ${PATH}/:id/posts`, () => {
      it('should return 404 if not exist blog', async () => {
        await request(app)
          .get(`${PATH}/${validMongoId}/posts`)
          .set('Authorization', validAuth)
          .expect(HttpStatus.NOT_FOUND);
      });

      it('should return Paginated<[]> when no posts', async () => {
        const blog = await createBlog(app);
        const response = await request(app)
          .get(`${PATH}/${blog.id}/posts`)
          .expect(HttpStatus.OK);

        expect(response.body).toEqual({
          items: [],
          page: 1,
          pageSize: 10,
          pagesCount: 0,
          totalCount: 0,
        });
      });

      it('should return list of posts', async () => {
        const [blog, blog2] = await createBlogs(2, app);

        await request(app)
          .post(`${PATH}/${blog.id}/posts`)
          .set('Authorization', validAuth)
          .send(newPost)
          .expect(HttpStatus.CREATED);
        await request(app)
          .post(`${PATH}/${blog2.id}/posts`)
          .set('Authorization', validAuth)
          .send(newPost)
          .expect(HttpStatus.CREATED);
        await request(app)
          .post(`${PATH}/${blog.id}/posts`)
          .set('Authorization', validAuth)
          .send(newPost)
          .expect(HttpStatus.CREATED);

        const response = await request(app)
          .get(`${PATH}/${blog.id}/posts`)
          .expect(HttpStatus.OK);

        expect(response.body.items.length).toBe(2);

        const response2 = await request(app)
          .get(`${PATH}/${blog2.id}/posts`)
          .expect(HttpStatus.OK);

        expect(response2.body.items.length).toBe(1);
      });
    });
  });
});
