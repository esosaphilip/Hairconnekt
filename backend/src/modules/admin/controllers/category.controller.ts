import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { AdminCategoryService } from '../services/admin-category.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
// Assuming we have roles guard and auth guard.
// For now, I'll assume standard JwtAuthGuard and RolesGuard exist.
// If roles exist, I should use Roles('ADMIN').
// Checking src/common/decorators/roles.decorator.ts
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserType } from '../../users/entities/user.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';

@Controller('admin/categories')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CategoryController {
  constructor(private readonly adminCategoryService: AdminCategoryService) {}

  @Post()
  @Roles(UserType.ADMIN)
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.adminCategoryService.create(createCategoryDto);
  }

  @Get()
  @Roles(UserType.ADMIN)
  findAll() {
    return this.adminCategoryService.findAll();
  }

  @Get(':id')
  @Roles(UserType.ADMIN)
  findOne(@Param('id') id: string) {
    return this.adminCategoryService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserType.ADMIN)
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.adminCategoryService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @Roles(UserType.ADMIN)
  remove(@Param('id') id: string) {
    return this.adminCategoryService.remove(id);
  }
}
