import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User, UserType } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LogoutDto } from './dto/logout.dto';
import { SocialLoginDto } from './dto/social-login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { VerifyPhoneDto } from './dto/verify-phone.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { RefreshToken } from './entities/refresh-token.entity';
import { jwtConfig } from '../../config/jwt.config';
import crypto from 'crypto';
import argon2 from 'argon2';
import { securityConfig } from '../../config/security.config';
import { sign, verify, Secret, SignOptions } from 'jsonwebtoken';
import { EmailService } from '../email/email.service';
import { SmsService } from '../sms/sms.service';
import { VerificationCode, VerificationChannel } from './entities/verification-code.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshRepo: Repository<RefreshToken>,
    @InjectRepository(VerificationCode)
    private readonly verificationRepo: Repository<VerificationCode>,
    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
    private readonly dataSource: DataSource,
  ) {}

  private isArgon2Hash(stored: string) {
    return /^\$argon2(id|i|d)\$/.test(stored);
  }

  private isPBKDF2Hash(stored: string) {
    return stored.startsWith('pbkdf2$');
  }

  private async hashPassword(plain: string) {
    const sec = securityConfig();
    const passwordWithPepper = `${plain}${sec.passwordPepper}`;
    return await argon2.hash(passwordWithPepper, {
      type: argon2.argon2id,
      timeCost: sec.argon2.timeCost,
      memoryCost: sec.argon2.memoryCost,
      parallelism: sec.argon2.parallelism,
    });
  }

  private async verifyPassword(plain: string, stored: string) {
    try {
      if (this.isArgon2Hash(stored)) {
        const sec = securityConfig();
        const passwordWithPepper = `${plain}${sec.passwordPepper}`;
        return await argon2.verify(stored, passwordWithPepper);
      }
      if (this.isPBKDF2Hash(stored)) {
        const [scheme, iterStr, salt, expected] = stored.split('$');
        if (scheme !== 'pbkdf2') return false;
        const iterations = parseInt(iterStr, 10) || 100000;
        const hash = crypto
          .pbkdf2Sync(plain, salt, iterations, 32, 'sha256')
          .toString('hex');
        return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(expected));
      }
      return false;
    } catch {
      return false;
    }
  }

  private signTokens(user: User) {
    const cfg = jwtConfig();
    const payload = { sub: user.id, email: user.email, userType: user.userType };
    const accessToken = sign(
      payload,
      cfg.accessTokenSecret as Secret,
      { expiresIn: cfg.accessTokenExpiresIn as any } as SignOptions,
    );
    const refreshToken = sign(
      { sub: user.id },
      cfg.refreshTokenSecret as Secret,
      { expiresIn: cfg.refreshTokenExpiresIn as any } as SignOptions,
    );
    return { accessToken, refreshToken };
  }

  private parseLoginIdentifier(id: string) {
    // crude check: contains '@' -> email; else phone
    if (id.includes('@')) return { by: 'email' as const, value: id.toLowerCase() };
    return { by: 'phone' as const, value: id };
  }

  private hashRefreshToken(raw: string) {
    // Optional peppering: reuse PASSWORD_PEPPER for simplicity; can be extended to a separate pepper
    const sec = securityConfig();
    // Hash with sha256 to store in DB
    return crypto.createHash('sha256').update(`${raw}${sec.passwordPepper}`, 'utf8').digest('hex');
  }

  // Normalize phone numbers by stripping non-digit characters
  private sanitizePhone(phone: string) {
    try {
      return (phone || '').replace(/\D/g, '');
    } catch {
      return phone;
    }
  }

  // === Verification code helpers ===
  private generateVerificationCode(length = Number(process.env.VERIFICATION_CODE_LENGTH || 6)) {
    const digits = '0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
      code += digits[Math.floor(Math.random() * 10)];
    }
    return code;
  }

  private hashVerificationCode(raw: string) {
    const pepper = process.env.VERIFICATION_CODE_PEPPER || 'hc-verify-pepper';
    return crypto.createHash('sha256').update(`${raw}${pepper}`, 'utf8').digest('hex');
  }

  private verificationTtlMs() {
    const minutes = Number(process.env.VERIFICATION_CODE_TTL_MINUTES || 10);
    return minutes * 60_000;
  }

  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase();
    const phoneSanitized = this.sanitizePhone(dto.phone);
    // Use a DB transaction so that user creation and initial refresh token persistence are atomic
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const userRepo = queryRunner.manager.getRepository(User);
      const rTokenRepo = queryRunner.manager.getRepository(RefreshToken);

      // Pre-checks to give friendly errors (unique constraints also exist on DB)
      const existingEmail = await userRepo.findOne({ where: { email } });
      if (existingEmail) throw new BadRequestException('Email already registered');
      const existingPhone = await userRepo.findOne({ where: { phone: phoneSanitized } });
      if (existingPhone) throw new BadRequestException('Phone already registered');

      const passwordHash = await this.hashPassword(dto.password);
      const user = userRepo.create({
        email,
        phone: phoneSanitized,
        firstName: dto.firstName,
        lastName: dto.lastName,
        userType: dto.userType as UserType,
        passwordHash,
        emailVerified: false,
        phoneVerified: false,
        lastLogin: new Date(),
      });
      const saved = await userRepo.save(user);

      const { accessToken, refreshToken } = this.signTokens(saved);
      // persist refresh token (rotation support) within the same transaction
      const cfg = jwtConfig();
      const expiresAt = new Date(Date.now() + this.parseExpiryMs(cfg.refreshTokenExpiresIn));
      const tokenHash = this.hashRefreshToken(refreshToken);
      await rTokenRepo.save(
        rTokenRepo.create({ userId: saved.id, tokenHash, token: null, expiresAt }),
      );

      await queryRunner.commitTransaction();

      // Post-commit: create and send verification codes without blocking the response
      this.createAndSendVerifications(saved).catch(() => undefined);
      return { user: this.publicUser(saved), tokens: { accessToken, refreshToken } };
    } catch (err: any) {
      await queryRunner.rollbackTransaction();
      // Handle unique constraint race conditions gracefully
      if (err?.code === '23505') {
        // Determine which field
        const detail: string = err.detail || '';
        if (detail.includes('(email)')) {
          throw new BadRequestException('Email already registered');
        }
        if (detail.includes('(phone)')) {
          throw new BadRequestException('Phone already registered');
        }
      }
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async login(dto: LoginDto) {
    const id = this.parseLoginIdentifier(dto.emailOrPhone);
    let user: User | null = null;
    if (id.by === 'phone') {
      const phoneSanitized = this.sanitizePhone(id.value);
      // Backward compatibility: search by sanitized or original value
      user = await this.usersRepo.findOne({ where: [{ phone: phoneSanitized }, { phone: id.value }] as any });
    } else {
      user = await this.usersRepo.findOne({ where: { [id.by]: id.value } as any });
    }
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const ok = await this.verifyPassword(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    // If legacy PBKDF2 hash verified, upgrade to argon2 with pepper transparently
    if (this.isPBKDF2Hash(user.passwordHash)) {
      const newHash = await this.hashPassword(dto.password);
      user.passwordHash = newHash;
    }
    user.lastLogin = new Date();
    await this.usersRepo.save(user);
    const { accessToken, refreshToken } = this.signTokens(user);
    const cfg = jwtConfig();
    const expiresAt = new Date(Date.now() + this.parseExpiryMs(cfg.refreshTokenExpiresIn));
    const tokenHash = this.hashRefreshToken(refreshToken);
    await this.refreshRepo.save(this.refreshRepo.create({ userId: user.id, tokenHash, token: null, expiresAt }));

    return { user: this.publicUser(user), tokens: { accessToken, refreshToken } };
  }

  async refresh(dto: RefreshTokenDto) {
    const cfg = jwtConfig();
    try {
      const payload = verify(dto.refreshToken, cfg.refreshTokenSecret as Secret) as any;
      // Check DB that token exists and not revoked (by token hash)
      const tokenHash = this.hashRefreshToken(dto.refreshToken);
      const record = await this.refreshRepo.findOne({ where: { tokenHash } });
      if (!record || record.revokedAt || (record.expiresAt && record.expiresAt < new Date())) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      const user = await this.usersRepo.findOne({ where: { id: payload.sub } });
      if (!user) throw new UnauthorizedException('User not found');
      // rotate: revoke old and issue new
      record.revokedAt = new Date();
      await this.refreshRepo.save(record);
      const { accessToken, refreshToken } = this.signTokens(user);
      const expiresAt = new Date(Date.now() + this.parseExpiryMs(cfg.refreshTokenExpiresIn));
      const newHash = this.hashRefreshToken(refreshToken);
      await this.refreshRepo.save(this.refreshRepo.create({ userId: user.id, tokenHash: newHash, token: null, expiresAt }));
      return { tokens: { accessToken, refreshToken } };
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(dto: LogoutDto) {
    const tokenHash = this.hashRefreshToken(dto.refreshToken);
    const record = await this.refreshRepo.findOne({ where: { tokenHash } });
    if (!record) return { success: true };
    record.revokedAt = new Date();
    await this.refreshRepo.save(record);
    return { success: true };
  }

  // Stubs for v1 - can be implemented with SMS/Email services and verification tables
  async socialLogin(_dto: SocialLoginDto) {
    return { message: 'Social login not yet implemented' };
  }
  async forgotPassword(dto: ForgotPasswordDto) {
    // Accept either email or phone; do not reveal whether user exists
    const id = this.parseLoginIdentifier(dto.emailOrPhone);
    let user: User | null = null;
    if (id.by === 'email') {
      user = await this.usersRepo.findOne({ where: { email: id.value } });
    } else {
      const phoneSanitized = this.sanitizePhone(id.value);
      user = await this.usersRepo.findOne({ where: [{ phone: phoneSanitized }, { phone: id.value }] as any });
    }
    if (!user) {
      // Always return success to avoid account enumeration
      return { success: true };
    }

    await this.createAndSendPasswordReset(user);
    return { success: true };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const tokenHash = this.hashVerificationCode(dto.token);
    const now = new Date();
    // Find a valid, unconsumed reset token
    const v = await this.verificationRepo.findOne({
      where: {
        channel: VerificationChannel.PASSWORD_RESET,
        codeHash: tokenHash,
      },
      relations: ['user'],
    });
    if (!v || v.consumedAt || v.expiresAt < now) {
      throw new BadRequestException('Invalid or expired reset token');
    }
    const user = v.user;
    // Update password and consume token atomically
    await this.dataSource.transaction(async (manager) => {
      const vRepo = manager.getRepository(VerificationCode);
      const uRepo = manager.getRepository(User);

      v.consumedAt = new Date();
      await vRepo.save(v);

      user.passwordHash = await this.hashPassword(dto.newPassword);
      await uRepo.save(user);

      // Invalidate other outstanding password reset tokens
      await vRepo
        .createQueryBuilder()
        .update(VerificationCode)
        .set({ consumedAt: () => 'now()' })
        .where('"userId" = :uid AND channel = :channel AND "consumed_at" IS NULL', {
          uid: user.id,
          channel: VerificationChannel.PASSWORD_RESET,
        })
        .execute();
    });

    // Optional: send confirmation email
    if (user.email) {
      this.emailService
        .sendWelcomeEmail(user.email, user.firstName || user.email)
        .catch(() => undefined);
    }
    return { success: true };
  }
  async verifyEmail(dto: VerifyEmailDto) {
    const email = dto.email.toLowerCase();
    const user = await this.usersRepo.findOne({ where: { email } });
    const genericError = new BadRequestException('Invalid or expired verification code');
    if (!user) throw genericError;
    if (user.emailVerified) return { success: true, alreadyVerified: true };

    // Dev bypass: allow a fixed code to verify without consuming a record
    const devBypassEnabled = (process.env.DEV_VERIFICATION_BYPASS === 'true' || process.env.DEV_VERIFICATION_BYPASS === '1') && process.env.NODE_ENV !== 'production';
    const devBypassCode = process.env.DEV_VERIFICATION_CODE || '000000';
    if (devBypassEnabled && dto.code === devBypassCode) {
      await this.usersRepo.update({ id: user.id }, { emailVerified: true });
      // Optionally clean up outstanding codes for EMAIL channel
      await this.verificationRepo
        .createQueryBuilder()
        .update(VerificationCode)
        .set({ consumedAt: () => 'now()' })
        .where('"userId" = :uid AND channel = :channel AND "consumed_at" IS NULL', {
          uid: user.id,
          channel: VerificationChannel.EMAIL,
        })
        .execute();
      // Send welcome email in dev bypass as well
      this.emailService
        .sendWelcomeEmail(user.email, user.firstName || user.email)
        .catch(() => undefined);
      return { success: true, bypass: true };
    }

    const codeHash = this.hashVerificationCode(dto.code);
    const now = new Date();

    // Transaction: consume code and update user atomically
    await this.dataSource.transaction(async (manager) => {
      const vRepo = manager.getRepository(VerificationCode);
      const uRepo = manager.getRepository(User);

      const v = await vRepo.findOne({
        where: {
          user: { id: user.id },
          channel: VerificationChannel.EMAIL,
          codeHash,
        },
        relations: ['user'],
      });
      if (!v || v.consumedAt || v.expiresAt < now) throw genericError;

      v.consumedAt = now;
      await vRepo.save(v);

      user.emailVerified = true;
      await uRepo.save(user);

      // Optionally invalidate other outstanding codes for this channel
      await vRepo
        .createQueryBuilder()
        .update(VerificationCode)
        .set({ consumedAt: () => 'now()' })
        .where('"userId" = :uid AND channel = :channel AND "consumed_at" IS NULL', {
          uid: user.id,
          channel: VerificationChannel.EMAIL,
        })
        .execute();
    });

    // Optional: send welcome email after verification
    this.emailService
      .sendWelcomeEmail(user.email, user.firstName || user.email)
      .catch(() => undefined);

    return { success: true };
  }

  async verifyPhone(dto: VerifyPhoneDto) {
    const phone = this.sanitizePhone(dto.phone);
    const user = await this.usersRepo.findOne({ where: { phone } });
    const genericError = new BadRequestException('Invalid or expired verification code');
    if (!user) throw genericError;
    if (user.phoneVerified) return { success: true, alreadyVerified: true };

    // Dev bypass: allow a fixed code to verify without consuming a record
    const devBypassEnabled = (process.env.DEV_VERIFICATION_BYPASS === 'true' || process.env.DEV_VERIFICATION_BYPASS === '1') && process.env.NODE_ENV !== 'production';
    const devBypassCode = process.env.DEV_VERIFICATION_CODE || '000000';
    if (devBypassEnabled && dto.code === devBypassCode) {
      await this.usersRepo.update({ id: user.id }, { phoneVerified: true });
      await this.verificationRepo
        .createQueryBuilder()
        .update(VerificationCode)
        .set({ consumedAt: () => 'now()' })
        .where('"userId" = :uid AND channel = :channel AND "consumed_at" IS NULL', {
          uid: user.id,
          channel: VerificationChannel.PHONE,
        })
        .execute();
      return { success: true, bypass: true };
    }

    const codeHash = this.hashVerificationCode(dto.code);
    const now = new Date();

    await this.dataSource.transaction(async (manager) => {
      const vRepo = manager.getRepository(VerificationCode);
      const uRepo = manager.getRepository(User);

      const v = await vRepo.findOne({
        where: {
          user: { id: user.id },
          channel: VerificationChannel.PHONE,
          codeHash,
        },
        relations: ['user'],
      });
      if (!v || v.consumedAt || v.expiresAt < now) throw genericError;

      v.consumedAt = now;
      await vRepo.save(v);

      user.phoneVerified = true;
      await uRepo.save(user);

      await vRepo
        .createQueryBuilder()
        .update(VerificationCode)
        .set({ consumedAt: () => 'now()' })
        .where('"userId" = :uid AND channel = :channel AND "consumed_at" IS NULL', {
          uid: user.id,
          channel: VerificationChannel.PHONE,
        })
        .execute();
    });

    return { success: true };
  }

  async resendVerification(dto: ResendVerificationDto) {
    // Identify user by email or phone
    let user: User | null = null;
    if (dto.email) {
      user = await this.usersRepo.findOne({ where: { email: dto.email.toLowerCase() } });
      if (!user) return { success: true };
      if (dto.channel && dto.channel !== 'email') {
        // If mismatch, default to email since provided
      }
      if (user.emailVerified) return { success: true, alreadyVerified: true };
      await this.createAndSendVerificationFor(user, VerificationChannel.EMAIL);
      return { success: true };
    }
    if (dto.phone) {
      const phoneSanitized = this.sanitizePhone(dto.phone);
      user = await this.usersRepo.findOne({ where: [{ phone: phoneSanitized }, { phone: dto.phone }] as any });
      if (!user) return { success: true };
      if (dto.channel && dto.channel !== 'phone') {
        // ignore mismatch
      }
      if (user.phoneVerified) return { success: true, alreadyVerified: true };
      await this.createAndSendVerificationFor(user, VerificationChannel.PHONE);
      return { success: true };
    }
    // If neither provided, cannot proceed
    throw new BadRequestException('Must provide email or phone');
  }

  private async createAndSendVerifications(user: User) {
    const ttlMs = this.verificationTtlMs();
    const expiresAt = new Date(Date.now() + ttlMs);

    const toSend: Array<{
      channel: VerificationChannel;
      destination: string;
      code: string;
      name?: string;
    }> = [];

    await this.dataSource.transaction(async (manager) => {
      const vRepo = manager.getRepository(VerificationCode);

      const createFor = async (
        channel: VerificationChannel,
        destination: string,
        name?: string,
      ) => {
        await vRepo
          .createQueryBuilder()
          .delete()
          .from(VerificationCode)
          .where('"userId" = :uid AND channel = :channel AND "consumed_at" IS NULL', {
            uid: user.id,
            channel,
          })
          .execute();

        const code = this.generateVerificationCode();
        const codeHash = this.hashVerificationCode(code);

        const record = vRepo.create({
          user: { id: user.id } as any,
          channel,
          destination,
          codeHash,
          expiresAt,
        });
        await vRepo.save(record);

        toSend.push({ channel, destination, code, name });
      };

      if (user.email && !user.emailVerified) {
        await createFor(VerificationChannel.EMAIL, user.email, user.firstName || undefined);
      }
      if (user.phone && !user.phoneVerified) {
        await createFor(VerificationChannel.PHONE, user.phone, user.firstName || undefined);
      }
    });

    // After the transaction commits, perform the side effects
    for (const item of toSend) {
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.log(
          `[DEV] Verification code for ${item.channel} (${item.destination}): ${item.code}`,
        );
      }
      if (item.channel === VerificationChannel.EMAIL) {
        this.emailService
          .sendVerificationCodeEmail(item.destination, item.code, item.name)
          .catch(() => undefined);
      } else if (item.channel === VerificationChannel.PHONE) {
        const minutes = Math.max(1, Number(process.env.VERIFICATION_CODE_TTL_MINUTES || 10));
        const body = `Your Hairconnekt verification code is ${item.code}. It expires in ${minutes} minutes.`;
        this.smsService.sendSms(item.destination, body).catch(() => undefined);
      }
    }
  }

  private async createAndSendVerificationFor(user: User, channel: VerificationChannel) {
    const ttlMs = this.verificationTtlMs();
    const expiresAt = new Date(Date.now() + ttlMs);
    const vRepo = this.verificationRepo;

    // Clear any existing unconsumed codes for this channel
    await vRepo
      .createQueryBuilder()
      .delete()
      .from(VerificationCode)
      .where('"userId" = :uid AND channel = :channel AND "consumed_at" IS NULL', {
        uid: user.id,
        channel,
      })
      .execute();

    const dest = channel === VerificationChannel.EMAIL ? user.email : user.phone;
    if (!dest) return;
    const code = this.generateVerificationCode();
    const codeHash = this.hashVerificationCode(code);
    const record = vRepo.create({
      user: { id: user.id } as any,
      channel,
      destination: dest,
      codeHash,
      expiresAt,
    });
    await vRepo.save(record);

    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.log(`[DEV] Verification code for ${channel} (${dest}): ${code}`);
    }
    if (channel === VerificationChannel.EMAIL) {
      this.emailService
        .sendVerificationCodeEmail(dest, code, user.firstName || undefined)
        .catch(() => undefined);
    } else if (channel === VerificationChannel.PHONE) {
      const minutes = Math.max(1, Number(process.env.VERIFICATION_CODE_TTL_MINUTES || 10));
      const body = `Your Hairconnekt verification code is ${code}. It expires in ${minutes} minutes.`;
      this.smsService.sendSms(dest, body).catch(() => undefined);
    }
  }

  private async createAndSendPasswordReset(user: User) {
    const ttlMs = this.verificationTtlMs();
    const expiresAt = new Date(Date.now() + ttlMs);
    const vRepo = this.verificationRepo;

    await vRepo
      .createQueryBuilder()
      .delete()
      .from(VerificationCode)
      .where('"userId" = :uid AND channel = :channel AND "consumed_at" IS NULL', {
        uid: user.id,
        channel: VerificationChannel.PASSWORD_RESET,
      })
      .execute();

    // Use a long random token for password reset
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = this.hashVerificationCode(token);
    const destination = user.email || user.phone || '';
    const record = vRepo.create({
      user: { id: user.id } as any,
      channel: VerificationChannel.PASSWORD_RESET,
      destination,
      codeHash: tokenHash,
      expiresAt,
    });
    await vRepo.save(record);

    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.log(`[DEV] Password reset token for ${user.email || user.phone}: ${token}`);
    }
    if (user.email) {
      const name = user.firstName || undefined;
      await this.emailService
        .sendPasswordResetEmail(user.email, token, name)
        .catch(() => undefined);
    } else if (user.phone) {
      const minutes = Math.max(1, Number(process.env.VERIFICATION_CODE_TTL_MINUTES || 10));
      const body = `Your Hairconnekt password reset token is ${token}. It expires in ${minutes} minutes.`;
      await this.smsService.sendSms(user.phone, body).catch(() => undefined);
    }
  }

  private publicUser(u: User) {
    const { passwordHash, ...rest } = u as any;
    return rest;
  }

  private parseExpiryMs(expr: string): number {
    // supports e.g., '15m', '7d', '3600s'
    const m = /^([0-9]+)([smhd])$/.exec(expr);
    if (!m) {
      const n = Number(expr);
      return Number.isFinite(n) ? n : 0;
    }
    const val = Number(m[1]);
    const unit = m[2];
    const multipliers: any = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
    return val * multipliers[unit];
  }
}