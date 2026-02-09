import { Module } from '@nestjs/common';
import { CashShiftsService } from './cash-shifts.service';
import { CashShiftsController } from './cash-shifts.controller';
import { PrismaModule } from '../database/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [CashShiftsController],
    providers: [CashShiftsService],
    exports: [CashShiftsService],
})
export class CashShiftsModule { }
