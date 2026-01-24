import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // Support both JWT_ACCESS_SECRET (current) and JWT_SECRET (alt naming)
      secretOrKey:
        process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'CHANGE_ME',
    });
  }

  async validate(payload: any) {
    console.log('[JwtStrategy] Validating payload:', payload);
    try {
      const user = await this.usersRepo.findOne({ where: { id: payload?.sub } });
      if (!user) {
        console.warn('[JwtStrategy] User not found for payload:', payload);
        return payload;
      }
      // console.log('[JwtStrategy] User found:', user.email, user.userType);
      return {
        sub: user.id,
        email: user.email,
        userType: user.userType,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        isActive: user.isActive,
      };
    } catch {
      return payload;
    }
  }
}