import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {

  constructor(
    private readonly productsService: ProductsService,
    private readonly prisma: PrismaService,
  ) { }

  @Get('categories')
  async findAllCategories() {
    const tenant = await this.getDemoTenant();
    return this.productsService.findAllCategories(tenant.id);
  }

  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    const tenant = await this.getDemoTenant();
    return this.productsService.create({
      ...createProductDto,
      tenantId: tenant.id,
    });
  }

  @Get()
  async findAll() {
    const tenant = await this.getDemoTenant();
    return this.productsService.findAll(tenant.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  private async getDemoTenant() {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug: 'agencia-demo' },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant no encontrado. Ejecuta el seed primero.');
    }
    return tenant;
  }
}

