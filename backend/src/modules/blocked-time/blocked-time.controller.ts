import { Body, Controller, Post, Patch, UseGuards, Req, Param } from '@nestjs/common';
import { BlockedTimeService } from './blocked-time.service';
import { CreateBlockedTimeDto } from './dto/create-blocked-time.dto';
import { UpdateBlockedTimeDto } from './dto/update-blocked-time.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('blocked-time')
export class BlockedTimeController {
  constructor(private readonly blockedTimeService: BlockedTimeService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createBlockedTimeDto: CreateBlockedTimeDto, @Req() req) {
    const providerId = req.user.providerId; // Assuming providerId is on the user object
    return this.blockedTimeService.create({ ...createBlockedTimeDto, providerId });
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBlockedTimeDto: UpdateBlockedTimeDto) {
    return this.blockedTimeService.update(id, updateBlockedTimeDto);
  }
}
