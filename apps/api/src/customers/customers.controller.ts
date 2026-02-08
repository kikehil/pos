import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('customers')
@UseGuards(JwtAuthGuard)
export class CustomersController {
    constructor(private readonly customersService: CustomersService) { }

    @Post()
    create(@Request() req: any, @Body() createCustomerDto: CreateCustomerDto) {
        return this.customersService.create(req.user.tenantId, createCustomerDto);
    }

    @Get()
    findAll(@Request() req: any) {
        return this.customersService.findAll(req.user.tenantId);
    }

    @Get(':id')
    findOne(@Request() req: any, @Param('id') id: string) {
        return this.customersService.findOne(id, req.user.tenantId);
    }

    @Patch(':id')
    update(@Request() req: any, @Param('id') id: string, @Body() updateCustomerDto: UpdateCustomerDto) {
        return this.customersService.update(id, req.user.tenantId, updateCustomerDto);
    }

    @Delete(':id')
    remove(@Request() req: any, @Param('id') id: string) {
        return this.customersService.remove(id, req.user.tenantId);
    }

    @Get(':id/history')
    getHistory(@Request() req: any, @Param('id') id: string) {
        return this.customersService.getHistory(id, req.user.tenantId);
    }
}

