import { Module } from '@nestjs/common';
import { PrismaModule } from './database/prisma.module';
import { ProductsModule } from './products/products.module';
import { SalesModule } from './sales/sales.module';
import { TenantsModule } from './tenants/tenants.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { CashShiftsModule } from './cash-shifts/cash-shifts.module';
import { UsersModule } from './users/users.module';
import { CustomersModule } from './customers/customers.module';
import { ExpensesModule } from './expenses.module';
import { InventoryModule } from './inventory/inventory.module';

@Module({
  imports: [PrismaModule, ProductsModule, SalesModule, TenantsModule, AnalyticsModule, AuthModule, CategoriesModule, CashShiftsModule, UsersModule, CustomersModule, ExpensesModule, InventoryModule],





  controllers: [],
  providers: [],
})
export class AppModule { }



