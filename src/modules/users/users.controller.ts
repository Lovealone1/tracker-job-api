import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto, SuspendUserDto } from './dto/update-user.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { UserSummaryResponseDto, UserDetailResponseDto } from './dto/user-response.dto';

@ApiTags('Admin Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN) // ENFORCES ADMIN ROLE FOR ALL ENDPOINTS IN THIS CONTROLLER
@Controller('api/v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'List all platform users' })
  @ApiResponse({
    status: 200,
    type: [UserSummaryResponseDto],
  })
  async findAll() {
    const users = await this.usersService.findAll();
    return plainToInstance(UserSummaryResponseDto, users);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a specific user profile' })
  @ApiResponse({
    status: 200,
    type: UserDetailResponseDto,
  })
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);
    return plainToInstance(UserDetailResponseDto, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update basic user data (Roles, enabled state, etc)' })
  @ApiResponse({
    status: 200,
    type: UserDetailResponseDto,
  })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const updated = await this.usersService.update(id, updateUserDto);
    return plainToInstance(UserDetailResponseDto, updated);
  }

  @Post(':id/suspend')
  @ApiOperation({ summary: 'Suspend/Ban a user via Supabase Auth' })
  @ApiResponse({ status: 200, description: 'User successfully suspended' })
  async suspend(@Param('id') id: string, @Body() dto: SuspendUserDto) {
    return this.usersService.suspendUserInSupabase(id, dto);
  }

  @Post(':id/unban')
  @ApiOperation({ summary: 'Remove a suspension/ban from a user in Supabase Auth' })
  @ApiResponse({ status: 200, description: 'User successfully unbanned' })
  async unban(@Param('id') id: string) {
    return this.usersService.unbanUserInSupabase(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Hard delete a user from the platform entirely' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully deleted.',
  })
  async remove(@Param('id') id: string) {
    await this.usersService.remove(id);
    return { message: 'User deleted successfully from DB and Auth' };
  }
}
