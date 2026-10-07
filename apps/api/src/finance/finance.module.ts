import { Module } from '@nestjs/common';
import { DebtsController } from './debts.controller.js';
import { CardsController } from './cards.controller.js';
import { AuthorizationGuard } from '../infrastructure/authorization/authorization.guard.js';

@Module({
  controllers: [DebtsController, CardsController],
  providers: [AuthorizationGuard],
})
export class FinanceModule {}
