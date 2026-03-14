import request from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { appSetup } from '../../src/setup/app.setup';
import { FULL_PATH } from '../../src/core/constants/paths';
import { PasswordRecoveryInputDto } from '../../src/modules/user-accounts/api/input-dto/password-recovery.input-dto';

describe('Auth API body validation', () => {
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

  const loginData = {
    loginOrEmail: 'ask@rest.com',
    password: 'some#Strict@pass',
  };

  describe.skip(`POST ${FULL_PATH.LOGIN}`, () => {
    it.each`
      field             | value    | message
      ${'loginOrEmail'} | ${null}  | ${'loginOrEmail should be string'}
      ${'loginOrEmail'} | ${5}     | ${'loginOrEmail should be string'}
      ${'loginOrEmail'} | ${''}    | ${'Length of loginOrEmail should be between 1 and Infinity'}
      ${'loginOrEmail'} | ${'   '} | ${'Length of loginOrEmail should be between 1 and Infinity'}
      ${'password'}     | ${null}  | ${'password should be string'}
      ${'password'}     | ${5}     | ${'password should be string'}
      ${'password'}     | ${''}    | ${'Length of password should be between 1 and Infinity'}
      ${'password'}     | ${'   '} | ${'Length of password should be between 1 and Infinity'}
    `(
      'should throw 400: field = $field, value = $value, message = $message',
      async ({ field, value, message }) => {
        const response = await request(app)
          .post(`${FULL_PATH.LOGIN}`)
          .send({ ...loginData, [field]: value })
          .expect(HttpStatus.BAD_REQUEST);

        expect(
          response.body.errorsMessages.find(
            (error: { field: string }) => error.field === field,
          )?.message,
        ).toBe(message);
      },
    );
  });

  describe.skip(`POST ${FULL_PATH.NEW_PASSWORD}`, () => {
    const newPassword = {
      recoveryCode: 'ask-rest-com',
      newPassword: 'some#Strict@pass',
    };

    it.each`
      field             | value                      | message
      ${'recoveryCode'} | ${null}                    | ${'recoveryCode should be string'}
      ${'recoveryCode'} | ${5}                       | ${'recoveryCode should be string'}
      ${'recoveryCode'} | ${''}                      | ${'Length of recoveryCode should be between 1 and Infinity'}
      ${'recoveryCode'} | ${'   '}                   | ${'Length of recoveryCode should be between 1 and Infinity'}
      ${'newPassword'}  | ${null}                    | ${'newPassword should be string'}
      ${'newPassword'}  | ${5}                       | ${'newPassword should be string'}
      ${'newPassword'}  | ${''}                      | ${'Length of newPassword should be between 6 and 20'}
      ${'newPassword'}  | ${'   '}                   | ${'Length of newPassword should be between 6 and 20'}
      ${'newPassword'}  | ${'somew'}                 | ${'Length of newPassword should be between 6 and 20'}
      ${'newPassword'}  | ${'someVeryLongPassworda'} | ${'Length of newPassword should be between 6 and 20'}
    `(
      'should throw 400: field = $field, value = $value, message = $message',
      async ({ field, value, message }) => {
        const response = await request(app)
          .post(`${FULL_PATH.NEW_PASSWORD}`)
          .send({ ...newPassword, [field]: value })
          .expect(HttpStatus.BAD_REQUEST);

        expect(
          response.body.errorsMessages.find(
            (error: { field: string }) => error.field === field,
          )?.message,
        ).toBe(message);
      },
    );
  });

  describe(`POST ${FULL_PATH.PASSWORD_RECOVERY}`, () => {
    const dto: PasswordRecoveryInputDto = {
      email: 'ask@rest.com',
    };

    it.each`
      field      | value             | message
      ${'email'} | ${5}              | ${'email must be a string; Received value: 5'}
      ${'email'} | ${''}             | ${'email must be longer than or equal to 5 characters; Received value: '}
      ${'email'} | ${'   '}          | ${'email must be longer than or equal to 5 characters; Received value: '}
      ${'email'} | ${'w$@w.s_u'}     | ${'email must match /^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$/i regular expression; Received value: w$@w.s_u'}
      ${'email'} | ${'ar-23_ZvfrtV'} | ${'email must match /^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$/i regular expression; Received value: ar-23_ZvfrtV'}
    `(
      'should throw 400: field = $field, value = $value, message = $message',
      async ({ field, value, message }) => {
        const response = await request(app)
          .post(`${FULL_PATH.PASSWORD_RECOVERY}`)
          .send({ ...dto, [field]: value })
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
