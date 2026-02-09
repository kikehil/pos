import { Controller, Get, Post, Body, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { CashShiftsService } from './cash-shifts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../database/prisma.service';

@Controller('cash-shifts')
@UseGuards(JwtAuthGuard)
export class CashShiftsController {
    constructor(
        private readonly cashShiftsService: CashShiftsService,
        private readonly prisma: PrismaService,
    ) { }

    @Get('current')
    async getCurrent(@Request() req: any) {
        // userId y tenantId vienen del JwtStrategy
        return this.cashShiftsService.getCurrentShift(req.user.userId, req.user.tenantId);
    }

    @Post('open')
    async open(@Request() req: any, @Body('amount') amount: number) {
        if (typeof amount === 'undefined') amount = 0;
        return this.cashShiftsService.openShift(req.user.userId, req.user.tenantId, amount);
    }

    @Post('close')
    async close(@Request() req: any, @Body('countedAmount') countedAmount: number) {
        const current = await this.cashShiftsService.getCurrentShift(req.user.userId, req.user.tenantId);
        if (!current) {
            throw new ForbiddenException('No hay un turno abierto para cerrar');
        }
        return this.cashShiftsService.closeShift(current.id, countedAmount);
    }

}
