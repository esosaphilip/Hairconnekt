import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserType } from '../../users/entities/user.entity';
import { AdminStatsService } from '../services/admin-stats.service';

@Controller('admin/stats')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserType.ADMIN)
export class AdminStatsController {
    constructor(private readonly adminStatsService: AdminStatsService) { }

    @Get()
    getStats() {
        return this.adminStatsService.getStats();
    }
}
