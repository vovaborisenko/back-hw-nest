import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserAccountsModule } from './modules/user-accounts/user-accounts.module';
import { BloggersPlatformModule } from './modules/bloggers-platform/bloggers-platform.module';
import { APP_FILTER } from '@nestjs/core';
import { AllHttpExceptionsFilter } from './core/exceptions/filters/all-exseptions.filter';
import { DomainHttpExceptionsFilter } from './core/exceptions/filters/domain-exceptions.filter';
import { ThrottlerExceptionFilter } from './core/exceptions/filters/throttler-exceptions.filter';

@Module({
  imports: [
    CqrsModule.forRoot(),
    ConfigModule.forRoot(),
    MongooseModule.forRoot(
      process.env.MONGO_URL || 'mongodb://localhost:27017/incubator-hw',
      { dbName: process.env.DB_NAME },
    ),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 1e4,
          limit: 5,
        },
      ],
    }),
    UserAccountsModule,
    BloggersPlatformModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllHttpExceptionsFilter,
    },
    {
      provide: APP_FILTER,
      useClass: DomainHttpExceptionsFilter,
    },
    {
      provide: APP_FILTER,
      useClass: ThrottlerExceptionFilter,
    },
  ],
})
export class AppModule {}
