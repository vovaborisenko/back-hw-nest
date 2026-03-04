import request from 'supertest';
import { validAuth } from '../constants/common';
import { userDto } from '../utils/user/user.util';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { appSetup } from '../../src/setup/app.setup';

const PATH = '/api/users';

describe.skip('Users API body validation', () => {
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

    await request(app)
      .delete('/api/testing/all-data')
      .expect(HttpStatus.NO_CONTENT);
  });

  afterAll(async () => {
    await nestApp!.close();
  });

  const longPassword = 'asff-awf+asws@ASDf$f#';

  describe(`POST ${PATH}`, () => {
    it.each`
      field         | value             | message
      ${'login'}    | ${null}           | ${'login should be string'}
      ${'login'}    | ${5}              | ${'login should be string'}
      ${'login'}    | ${''}             | ${'Length of login should be between 3 and 10'}
      ${'login'}    | ${'   '}          | ${'Length of login should be between 3 and 10'}
      ${'login'}    | ${'ar '}          | ${'Length of login should be between 3 and 10'}
      ${'login'}    | ${'ar-23_ZvtV45'} | ${'Length of login should be between 3 and 10'}
      ${'login'}    | ${'ar-23+vtV'}    | ${'Invalid value'}
      ${'email'}    | ${null}           | ${'email should be string'}
      ${'email'}    | ${5}              | ${'email should be string'}
      ${'email'}    | ${''}             | ${'Length of email should be between 6 and Infinity'}
      ${'email'}    | ${'   '}          | ${'Length of email should be between 6 and Infinity'}
      ${'email'}    | ${'w@w.s'}        | ${'Length of email should be between 6 and Infinity'}
      ${'email'}    | ${'w$@w.s_u'}     | ${'Invalid value'}
      ${'email'}    | ${'ar-23_ZvfrtV'} | ${'Invalid value'}
      ${'password'} | ${null}           | ${'password should be string'}
      ${'password'} | ${5}              | ${'password should be string'}
      ${'password'} | ${''}             | ${'Length of password should be between 6 and 20'}
      ${'password'} | ${'   '}          | ${'Length of password should be between 6 and 20'}
      ${'password'} | ${' dfe@#  '}     | ${'Length of password should be between 6 and 20'}
      ${'password'} | ${longPassword}   | ${'Length of password should be between 6 and 20'}
    `(
      'should throw 400: field = $field, value = $value, message = $message',
      async ({ field, value, message }) => {
        const response = await request(app)
          .post(PATH)
          .set('Authorization', validAuth)
          .send({ ...userDto.create[0], [field]: value })
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
