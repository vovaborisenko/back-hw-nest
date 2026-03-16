import request from 'supertest';
import { validAuth } from '../constants/common';
import { blogDto, createBlog } from '../utils/blog/blog.util';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { appSetup } from '../../src/setup/app.setup';

const PATH = '/api/blogs';

describe.skip('Blogs API body validation', () => {
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
      .delete(FULL_PATH.TESTING_ALL)
      .expect(HttpStatus.NO_CONTENT);
  });

  describe(`POST ${PATH}`, () => {
    it.each`
      field            | value              | message
      ${'name'}        | ${null}            | ${'name should be string'}
      ${'name'}        | ${5}               | ${'name should be string'}
      ${'name'}        | ${''}              | ${'Length of name should be between 1 and 15'}
      ${'name'}        | ${'    '}          | ${'Length of name should be between 1 and 15'}
      ${'name'}        | ${'4'.repeat(16)}  | ${'Length of name should be between 1 and 15'}
      ${'description'} | ${null}            | ${'description should be string'}
      ${'description'} | ${5}               | ${'description should be string'}
      ${'description'} | ${''}              | ${'Length of description should be between 1 and 500'}
      ${'description'} | ${'    '}          | ${'Length of description should be between 1 and 500'}
      ${'description'} | ${'4'.repeat(501)} | ${'Length of description should be between 1 and 500'}
      ${'websiteUrl'}  | ${null}            | ${'websiteUrl should be string'}
      ${'websiteUrl'}  | ${5}               | ${'websiteUrl should be string'}
      ${'websiteUrl'}  | ${''}              | ${'Length of websiteUrl should be between 1 and 100'}
      ${'websiteUrl'}  | ${'    '}          | ${'Length of websiteUrl should be between 1 and 100'}
      ${'websiteUrl'}  | ${'4'.repeat(101)} | ${'Length of websiteUrl should be between 1 and 100'}
    `(
      'should throw 400: field = $field, value = $value, message = $message',
      async ({ field, value, message }) => {
        const response = await request(app)
          .post(PATH)
          .set('Authorization', validAuth)
          .send({ ...blogDto.create, [field]: value })
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
      field            | value              | message
      ${'name'}        | ${null}            | ${'name should be string'}
      ${'name'}        | ${5}               | ${'name should be string'}
      ${'name'}        | ${''}              | ${'Length of name should be between 1 and 15'}
      ${'name'}        | ${'    '}          | ${'Length of name should be between 1 and 15'}
      ${'name'}        | ${'4'.repeat(16)}  | ${'Length of name should be between 1 and 15'}
      ${'description'} | ${null}            | ${'description should be string'}
      ${'description'} | ${5}               | ${'description should be string'}
      ${'description'} | ${''}              | ${'Length of description should be between 1 and 500'}
      ${'description'} | ${'    '}          | ${'Length of description should be between 1 and 500'}
      ${'description'} | ${'4'.repeat(501)} | ${'Length of description should be between 1 and 500'}
      ${'websiteUrl'}  | ${null}            | ${'websiteUrl should be string'}
      ${'websiteUrl'}  | ${5}               | ${'websiteUrl should be string'}
      ${'websiteUrl'}  | ${''}              | ${'Length of websiteUrl should be between 1 and 100'}
      ${'websiteUrl'}  | ${'    '}          | ${'Length of websiteUrl should be between 1 and 100'}
      ${'websiteUrl'}  | ${'4'.repeat(101)} | ${'Length of websiteUrl should be between 1 and 100'}
    `(
      'should throw 400: field = $field, value = $value, message = $message',
      async ({ field, value, message }) => {
        const blog = await createBlog(app);

        const response = await request(app)
          .put(`${PATH}/${blog.id}`)
          .set('Authorization', validAuth)
          .send({ ...blogDto.update, [field]: value })
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
