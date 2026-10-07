import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { MeController } from './me.controller.js';

@Module({
  controllers: [AuthController, MeController],
})
export class UsersModule {}
