import request from 'supertest';
import { validAuth } from '../constants/common';
import { createBlogAndHisPost, postDto } from '../utils/post/post.util';
import { createBlog } from '../utils/blog/blog.util';
import { createUserAndLogin } from '../utils/user/user.util';
// import { commentDto } from '../utils/comment/comment.util';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { appSetup } from '../../src/setup/app.setup';

const PATH = '/api/posts';

describe.skip('Posts API body validation', () => {
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

  describe(`POST ${PATH}`, () => {
    it.each`
      field                 | value               | message
      ${'title'}            | ${null}             | ${'title should be string'}
      ${'title'}            | ${5}                | ${'title should be string'}
      ${'title'}            | ${''}               | ${'Length of title should be between 1 and 30'}
      ${'title'}            | ${'    '}           | ${'Length of title should be between 1 and 30'}
      ${'title'}            | ${'4'.repeat(31)}   | ${'Length of title should be between 1 and 30'}
      ${'shortDescription'} | ${null}             | ${'shortDescription should be string'}
      ${'shortDescription'} | ${5}                | ${'shortDescription should be string'}
      ${'shortDescription'} | ${''}               | ${'Length of shortDescription should be between 1 and 100'}
      ${'shortDescription'} | ${'    '}           | ${'Length of shortDescription should be between 1 and 100'}
      ${'shortDescription'} | ${'4'.repeat(101)}  | ${'Length of shortDescription should be between 1 and 100'}
      ${'content'}          | ${null}             | ${'content should be string'}
      ${'content'}          | ${5}                | ${'content should be string'}
      ${'content'}          | ${''}               | ${'Length of content should be between 1 and 1000'}
      ${'content'}          | ${'    '}           | ${'Length of content should be between 1 and 1000'}
      ${'content'}          | ${'4'.repeat(1001)} | ${'Length of content should be between 1 and 1000'}
      ${'blogId'}           | ${null}             | ${'blogId should be string'}
      ${'blogId'}           | ${5}                | ${'blogId should be string'}
      ${'blogId'}           | ${''}               | ${'Length of blogId should be between 1 and Infinity'}
      ${'blogId'}           | ${'    '}           | ${'Length of blogId should be between 1 and Infinity'}
      ${'blogId'}           | ${'dsfr'}           | ${'ID is invalid'}
    `(
      'should throw 400: field = $field, value = $value, message = $message',
      async ({ field, value, message }) => {
        const blog = await createBlog(app);
        const response = await request(app)
          .post(PATH)
          .set('Authorization', validAuth)
          .send({ ...postDto.create, blogId: blog.id, [field]: value })
          .expect(HttpStatus.BAD_REQUEST);

        expect(
          response.body.errorsMessages.find(
            (error: { field: string }) => error.field === field,
          )?.message,
        ).toBe(message);
      },
    );
  });

  describe(`PUT ${PATH}/:id`, () => {
    it.each`
      field                 | value               | message
      ${'title'}            | ${null}             | ${'title should be string'}
      ${'title'}            | ${5}                | ${'title should be string'}
      ${'title'}            | ${''}               | ${'Length of title should be between 1 and 30'}
      ${'title'}            | ${'    '}           | ${'Length of title should be between 1 and 30'}
      ${'title'}            | ${'4'.repeat(31)}   | ${'Length of title should be between 1 and 30'}
      ${'shortDescription'} | ${null}             | ${'shortDescription should be string'}
      ${'shortDescription'} | ${5}                | ${'shortDescription should be string'}
      ${'shortDescription'} | ${''}               | ${'Length of shortDescription should be between 1 and 100'}
      ${'shortDescription'} | ${'    '}           | ${'Length of shortDescription should be between 1 and 100'}
      ${'shortDescription'} | ${'4'.repeat(101)}  | ${'Length of shortDescription should be between 1 and 100'}
      ${'content'}          | ${null}             | ${'content should be string'}
      ${'content'}          | ${5}                | ${'content should be string'}
      ${'content'}          | ${''}               | ${'Length of content should be between 1 and 1000'}
      ${'content'}          | ${'    '}           | ${'Length of content should be between 1 and 1000'}
      ${'content'}          | ${'4'.repeat(1001)} | ${'Length of content should be between 1 and 1000'}
      ${'blogId'}           | ${null}             | ${'blogId should be string'}
      ${'blogId'}           | ${5}                | ${'blogId should be string'}
      ${'blogId'}           | ${''}               | ${'Length of blogId should be between 1 and Infinity'}
      ${'blogId'}           | ${'    '}           | ${'Length of blogId should be between 1 and Infinity'}
      ${'blogId'}           | ${'dsfr'}           | ${'ID is invalid'}
    `(
      'should throw 400: field = $field, value = $value, message = $message',
      async ({ field, value, message }) => {
        const [blog, post] = await createBlogAndHisPost(app);

        const response = await request(app)
          .put(`${PATH}/${post.id}`)
          .set('Authorization', validAuth)
          .send({ ...postDto.update, blogId: blog.id, [field]: value })
          .expect(HttpStatus.BAD_REQUEST);

        expect(
          response.body.errorsMessages.find(
            (error: { field: string }) => error.field === field,
          )?.message,
        ).toBe(message);
      },
    );
  });

  describe(`PUT ${PATH}/:id/like-status`, () => {
    it.each`
      field           | value        | message
      ${'likeStatus'} | ${null}      | ${'likeStatus should be string'}
      ${'likeStatus'} | ${5}         | ${'likeStatus should be string'}
      ${'likeStatus'} | ${''}        | ${'Should be on of None, Like, Dislike'}
      ${'likeStatus'} | ${'    '}    | ${'Should be on of None, Like, Dislike'}
      ${'likeStatus'} | ${'unknown'} | ${'Should be on of None, Like, Dislike'}
    `(
      'should throw 400: field = $field, value = $value, message = $message',
      async ({ field, value, message }) => {
        const [, post] = await createBlogAndHisPost(app);
        const { token } = await createUserAndLogin(app);

        const response = await request(app)
          .put(`${PATH}/${post.id}/like-status`)
          .set('Authorization', `Bearer ${token}`)
          .send({ [field]: value })
          .expect(HttpStatus.BAD_REQUEST);

        expect(
          response.body.errorsMessages.find(
            (error: { field: string }) => error.field === field,
          )?.message,
        ).toBe(message);
      },
    );
  });

  describe(`POST ${PATH}/:id/comments`, () => {
    it.each`
      field        | value              | message
      ${'content'} | ${null}            | ${'content should be string'}
      ${'content'} | ${5}               | ${'content should be string'}
      ${'content'} | ${''}              | ${'Length of content should be between 20 and 300'}
      ${'content'} | ${'    '}          | ${'Length of content should be between 20 and 300'}
      ${'content'} | ${'4'.repeat(19)}  | ${'Length of content should be between 20 and 300'}
      ${'content'} | ${'l'.repeat(301)} | ${'Length of content should be between 20 and 300'}
    `(
      'should throw 400: field = $field, value = $value, message = $message',
      async ({ field, value, message }) => {
        const { token } = await createUserAndLogin(app);
        const [, post] = await createBlogAndHisPost(app);
        const response = await request(app)
          .post(`${PATH}/${post.id}/comments`)
          .set('Authorization', `Bearer ${token}`)
          // .send({ ...commentDto.create, [field]: value })
          .expect(HttpStatus.BAD_REQUEST);

        expect(
          response.body.errorsMessages.find(
            (error: { field: string }) => error.field === field,
          )?.message,
        ).toBe(message);
      },
    );
  });
});
