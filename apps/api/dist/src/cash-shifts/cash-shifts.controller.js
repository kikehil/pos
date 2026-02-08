"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CashShiftsController = void 0;
const common_1 = require("@nestjs/common");
const cash_shifts_service_1 = require("./cash-shifts.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const prisma_service_1 = require("../prisma/prisma.service");
let CashShiftsController = class CashShiftsController {
    constructor(cashShiftsService, prisma) {
        this.cashShiftsService = cashShiftsService;
        this.prisma = prisma;
    }
    async getCurrent(req) {
        return this.cashShiftsService.getCurrentShift(req.user.userId, req.user.tenantId);
    }
    async open(req, amount) {
        if (typeof amount === 'undefined')
            amount = 0;
        return this.cashShiftsService.openShift(req.user.userId, req.user.tenantId, amount);
    }
    async close(req, countedAmount) {
        const current = await this.cashShiftsService.getCurrentShift(req.user.userId, req.user.tenantId);
        if (!current) {
            throw new common_1.ForbiddenException('No hay un turno abierto para cerrar');
        }
        return this.cashShiftsService.closeShift(current.id, countedAmount);
    }
};
exports.CashShiftsController = CashShiftsController;
__decorate([
    (0, common_1.Get)('current'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CashShiftsController.prototype, "getCurrent", null);
__decorate([
    (0, common_1.Post)('open'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)('amount')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], CashShiftsController.prototype, "open", null);
__decorate([
    (0, common_1.Post)('close'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)('countedAmount')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], CashShiftsController.prototype, "close", null);
exports.CashShiftsController = CashShiftsController = __decorate([
    (0, common_1.Controller)('cash-shifts'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [cash_shifts_service_1.CashShiftsService,
        prisma_service_1.PrismaService])
], CashShiftsController);
//# sourceMappingURL=cash-shifts.controller.js.map