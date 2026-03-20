import request from 'supertest';
import { commentDto, createComment } from '../utils/comment/comment.util';
// import { LikeStatus } from '../../../src/likes/types/like';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { appSetup } from '../../src/setup/app.setup';
import { FULL_PATH } from '../../src/core/constants/paths';

describe('Comments API body validation', () => {
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

  describe(`PUT ${FULL_PATH.COMMENTS}/:id`, () => {
    it.each`
      field        | value              | message
      ${'content'} | ${null}            | ${'content must be a string'}
      ${'content'} | ${5}               | ${'content must be a string'}
      ${'content'} | ${''}              | ${'content must be longer than or equal to 20 characters'}
      ${'content'} | ${'    '}          | ${'content must be longer than or equal to 20 characters'}
      ${'content'} | ${'4'.repeat(19)}  | ${'content must be longer than or equal to 20 characters'}
      ${'content'} | ${'l'.repeat(301)} | ${'content must be shorter than or equal to 300 characters'}
    `(
      'should throw 400: field = $field, value = $value, message = $message',
      async ({ field, value, message }) => {
        const [comment, , token] = await createComment(app);
        const response = await request(app)
          .put(`${FULL_PATH.COMMENTS}/${comment.id}`)
          .set('Authorization', `Bearer ${token}`)
          .send({ ...commentDto.update, [field]: value })
          .expect(HttpStatus.BAD_REQUEST);

        expect(
          response.body.errorsMessages.find(
            (error: { field: string }) => error.field === field,
          )?.message,
        ).toBe(message);
      },
    );
  });

  describe(`PUT ${FULL_PATH.COMMENTS}/:id/like-status`, () => {
    it.each`
      field           | value        | message
      ${'likeStatus'} | ${null}      | ${'likeStatus must be one of the following values: None, Like, Dislike'}
      ${'likeStatus'} | ${5}         | ${'likeStatus must be one of the following values: None, Like, Dislike'}
      ${'likeStatus'} | ${''}        | ${'likeStatus must be one of the following values: None, Like, Dislike'}
      ${'likeStatus'} | ${'    '}    | ${'likeStatus must be one of the following values: None, Like, Dislike'}
      ${'likeStatus'} | ${'unknown'} | ${'likeStatus must be one of the following values: None, Like, Dislike'}
    `(
      'should throw 400: field = $field, value = $value, message = $message',
      async ({ field, value, message }) => {
        const [comment, , token] = await createComment(app);
        const response = await request(app)
          .put(`${FULL_PATH.COMMENTS}/${comment.id}/like-status`)
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
});
