import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { JwtAuthGuard } from '../src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../src/modules/auth/guards/roles.guard';
import { ServicesService } from '../src/modules/services/services.service';

describe('ServicesController (E2E)', () => {
  let app: INestApplication;
  let servicesService = {
    getProviderIdByUserId: jest.fn(),
    listForProvider: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ServicesService)
      .useValue(servicesService)
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true }) // Mock Auth
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true }) // Mock Roles
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/providers/me/services/:id (PATCH) - fails with non-UUID', () => {
    // Mock user in request
    // Since we bypassed guards, we might need to inject user via a custom middleware or just assume the controller extracts it safely?
    // The controller uses @Req() req.user.
    // With guards bypassed, req.user might be undefined.
    // We need to attach user to req.
    
    // Actually, mocking the Guard with `canActivate: (context) => { context.switchToHttp().getRequest().user = { sub: 'uid', userType: 'provider' }; return true; }` is better.
    return request(app.getHttpServer())
      .patch('/providers/me/services/bad-id')
      .send({ name: 'New Name' })
      .expect(400)
      .expect((res) => {
        expect(res.body.message).toContain('Validation failed (uuid is expected)');
      });
  });
});
