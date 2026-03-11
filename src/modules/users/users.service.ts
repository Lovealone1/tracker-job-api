import { Injectable, NotFoundException, Logger, ForbiddenException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { UpdateUserDto, SuspendUserDto } from './dto/update-user.dto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private supabaseAdmin: SupabaseClient;

  constructor(
    private readonly repository: UsersRepository,
    private configService: ConfigService,
  ) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseServiceRole = this.configService.get<string>('SUPABASE_SERVICE_ROLE');

    if (supabaseUrl && supabaseServiceRole) {
      this.supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });
    } else {
      this.logger.warn('SUPABASE_URL or SUPABASE_SERVICE_ROLE is not set. Admin Auth features will not work.');
    }
  }

  async findAll() {
    return this.repository.findAll();
  }

  async findOne(id: string) {
    const user = await this.repository.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    // 1. Update the local Prisma database profile
    const updated = await this.repository.update(id, updateUserDto);
    if (!updated) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }

    // 2. If 'enabled' was set to false, theoretically we want to instantly invalidate their token / ban them briefly
    // However, the explicit "ban" endpoint handles the Supabase layer more accurately.
    // Syncing basic email/password via Auth Admin can be done here if those were mutable.
    
    return updated;
  }

  async suspendUserInSupabase(id: string, suspendDto: SuspendUserDto) {
    if (!this.supabaseAdmin) {
      throw new ForbiddenException('Supabase Admin Client not initialized. Check your environment variables.');
    }

    const { data: user, error } = await this.supabaseAdmin.auth.admin.updateUserById(id, {
      ban_duration: `${suspendDto.banDurationHours}h`,
    });

    if (error) {
      this.logger.error(`Error banning user ${id} in Supabase Auth`, error);
      throw new Error(`Failed to suspend user: ${error.message}`);
    }

    // Also flip the enabled flag to false in the local DB purely to keep synced state visually
    await this.repository.update(id, { enabled: false });

    return { message: `User ${id} has been suspended for ${suspendDto.banDurationHours} hours.` };
  }

  async unbanUserInSupabase(id: string) {
    if (!this.supabaseAdmin) {
      throw new ForbiddenException('Supabase Admin Client not initialized.');
    }

    const { error } = await this.supabaseAdmin.auth.admin.updateUserById(id, {
      ban_duration: 'none',
    });

    if (error) {
      this.logger.error(`Error unbanning user ${id} in Supabase Auth`, error);
      throw new Error(`Failed to unban user: ${error.message}`);
    }

    await this.repository.update(id, { enabled: true });

    return { message: `User ${id} has been un-banned successfully.` };
  }

  async remove(id: string) {
    const deleted = await this.repository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }

    if (this.supabaseAdmin) {
      // Hard delete from Supabase Auth as well
      const { error } = await this.supabaseAdmin.auth.admin.deleteUser(id);
      if (error) {
        this.logger.warn(`User ${id} deleted from local DB but failed removal in Auth DB: ${error.message}`);
      }
    }

    return true;
  }
}
