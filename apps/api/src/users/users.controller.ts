import { Controller, Get, Post, Body, Delete, Param, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post()
    @Roles(UserRole.ADMIN)
    async create(@Request() req: any, @Body() createUserDto: any) {
        return this.usersService.create(req.user.tenantId, createUserDto);
    }

    @Get()
    @Roles(UserRole.ADMIN)
    async findAll(@Request() req: any) {
        return this.usersService.findAllByTenant(req.user.tenantId);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN)
    async remove(@Request() req: any, @Param('id') id: string) {
        if (req.user.userId === id) {
            throw new ForbiddenException('No puedes eliminarte a ti mismo');
        }
        return this.usersService.remove(id, req.user.tenantId);
    }
}
