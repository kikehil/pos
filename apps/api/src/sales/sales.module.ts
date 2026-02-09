import { Module } from '@nestjs/common';
import { SalesService } from './sales.service';
import { SalesController } from './sales.controller';
import { PrismaModule } from '../database/prisma.module';
import { CashShiftsModule } from '../cash-shifts/cash-shifts.module';

@Module({
  imports: [PrismaModule, CashShiftsModule],
  controllers: [SalesController],
  providers: [SalesService],
})
export class SalesModule { }

