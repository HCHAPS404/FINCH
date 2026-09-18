import { Module } from '@nestjs/common';
import { WorkspaceSampleController } from './workspace-sample.controller.js';
import { AuthorizationGuard } from '../infrastructure/authorization/authorization.guard.js';

@Module({
  controllers: [WorkspaceSampleController],
  providers: [AuthorizationGuard],
})
export class WorkspacesModule {}
