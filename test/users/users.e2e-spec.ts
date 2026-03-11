import request from 'supertest';
import { App } from 'supertest/types';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { invalidAuth, validAuth, validMongoId } from '../constants/common';
import { createUser, createUsers, userDto } from '../utils/user/user.util';
import { AppModule } from '../../src/app.module';
import { appSetup } from '../../src/setup/app.setup';

const PATH = '/api/users';

describe('UsersController (e2e)', () => {
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
    path            | method
    ${PATH}         | ${'get'}
    ${PATH}         | ${'post'}
    ${PATH + '/12'} | ${'delete'}
  `(
    'should return 401 when invalid header Authorization: [$method] $path',
    async ({
      path,
      method,
    }: {
      path: string;
      method: 'post' | 'get' | 'delete';
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
      const user = await createUser(app, userDto.create[0]);

      expect(user).toMatchObject({
        id: expect.any(String),
        login: userDto.create[0].login,
        email: userDto.create[0].email,
        createdAt: expect.any(String),
      });
    });

    it.each`
      field
      ${'login'}
      ${'email'}
    `('should throw 400 for the same $field', async ({ field }) => {
      await createUser(app, userDto.create[0]);

      const response = await request(app)
        .post(PATH)
        .set('Authorization', validAuth)
        .send({
          ...userDto.create[1],
          // @ts-ignore
          [field]: userDto.create[0][field],
        })
        .expect(HttpStatus.BAD_REQUEST);

      expect(
        response.body.errorsMessages.find(
          (error: { field: string }) => error.field === field,
        ),
      ).toBeTruthy();
      expect(response.body.errorsMessages.length).toBe(1);
    });
  });

  describe(`GET ${PATH}`, () => {
    it('should return items: [] when no users', async () => {
      const response = await request(app)
        .get(PATH)
        .set('Authorization', validAuth)
        .expect(HttpStatus.OK);

      expect(response.body).toEqual({
        items: [],
        page: 1,
        pageSize: 10,
        pagesCount: 0,
        totalCount: 0,
      });
    });

    describe('test query params', () => {
      beforeEach(async () => {
        await createUsers(2, app);
      });

      describe('pagination', () => {
        it('default', async () => {
          const response = await request(app)
            .get(PATH)
            .set('Authorization', validAuth)
            .expect(HttpStatus.OK);

          expect(response.body).toMatchObject({
            page: 1,
            pageSize: 10,
            pagesCount: 1,
            totalCount: 2,
          });
        });

        it('pageSize', async () => {
          const response = await request(app)
            .get(`${PATH}?pageSize=1`)
            .set('Authorization', validAuth)
            .expect(HttpStatus.OK);

          expect(response.body).toMatchObject({
            page: 1,
            pageSize: 1,
            pagesCount: 2,
            totalCount: 2,
          });
        });

        it('pageSize = 99', async () => {
          const response = await request(app)
            .get(`${PATH}?pageSize=99`)
            .set('Authorization', validAuth)
            .expect(HttpStatus.OK);

          expect(response.body).toMatchObject({
            page: 1,
            pageSize: 99,
            pagesCount: 1,
            totalCount: 2,
          });
        });
      });
    });
  });

  describe(`DELETE ${PATH}/:id`, () => {
    it('should return 400 when invalid id', async () => {
      await request(app)
        .delete(`${PATH}/someinvalidid`)
        .set('Authorization', validAuth)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return 404 when no user', async () => {
      await request(app)
        .delete(`${PATH}/${validMongoId}`)
        .set('Authorization', validAuth)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should return 204 when requested id exist', async () => {
      const [, user2] = await createUsers(2, app);

      await request(app)
        .delete(`${PATH}/${user2.id}`)
        .set('Authorization', validAuth)
        .expect(HttpStatus.NO_CONTENT);
    });
  });
});
