import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateAdjustmentDto } from './dto/create-adjustment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
    constructor(private readonly inventoryService: InventoryService) { }

    @Post('adjustments')
    create(@Request() req, @Body() createAdjustmentDto: CreateAdjustmentDto) {
        // Asumimos que el usuario viene en el request (JWT strategy)
        // y que tiene tenantId
        const userId = req.user.userId;
        const tenantId = req.user.tenantId; // Asegúrate de que tu JWT Strategy retorne esto

        return this.inventoryService.createAdjustment(userId, tenantId, createAdjustmentDto);
    }
}
