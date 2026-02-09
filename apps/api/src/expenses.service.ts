import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { PrismaService } from './database/prisma.service';

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) { }

  async create(createExpenseDto: CreateExpenseDto, userId: string) {
    const { amount, date, ...rest } = createExpenseDto;

    return this.prisma.expense.create({
      data: {
        ...rest,
        amount: Number(amount),
        date: date ? new Date(date) : new Date(),
        userId,
      },
      include: {
        user: { select: { name: true } }
      }
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.expense.findMany({
      where: { tenantId },
      orderBy: { date: 'desc' },
      include: {
        user: { select: { name: true } }
      }
    });
  }

  async findOne(id: string, tenantId: string) {
    const expense = await this.prisma.expense.findFirst({
      where: { id, tenantId },
      include: {
        user: { select: { name: true } }
      }
    });
    if (!expense) throw new NotFoundException('Gasto no encontrado');
    return expense;
  }

  async update(id: string, updateExpenseDto: UpdateExpenseDto, tenantId: string) {
    await this.findOne(id, tenantId);

    const { amount, date, ...rest } = updateExpenseDto;

    return this.prisma.expense.update({
      where: { id },
      data: {
        ...rest,
        amount: amount ? Number(amount) : undefined,
        date: date ? new Date(date) : undefined,
      },
    });
  }

  async remove(id: string, tenantId: string) {
    await this.findOne(id, tenantId);
    return this.prisma.expense.delete({
      where: { id },
    });
  }
}
