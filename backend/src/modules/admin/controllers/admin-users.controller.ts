import { Controller, Get, Post, Body, Param, Query, UseGuards, Patch, ParseIntPipe, ParseBoolPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserType } from '../../users/entities/user.entity';
import { AdminUsersService } from '../services/admin-users.service';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserType.ADMIN)
export class AdminUsersController {
    constructor(private readonly adminUsersService: AdminUsersService) { }

    @Get()
    findAll(
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('role') role?: UserType,
        @Query('search') search?: string,
    ) {
        return this.adminUsersService.findAll({ page, limit, role, search });
    }

    @Patch(':id/verify-provider')
    verifyProvider(
        @Param('id') id: string,
        @Body('isVerified') isVerified: boolean,
    ) {
        return this.adminUsersService.verifyProvider(id, isVerified);
    }
}
