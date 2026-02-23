import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './src/modules/users/users.service';
import { StorageService } from './src/modules/storage/storage.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { User } from './src/modules/users/entities/user.entity';

describe('UsersService - Avatar Upload', () => {
  let service: UsersService;
  let mockUserRepo: any;
  let mockStorageService: any;

  beforeEach(async () => {
    mockUserRepo = {
      findById: jest.fn(),
      save: jest.fn(),
    };

    mockStorageService = {
      uploadImage: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: 'IUserRepository', useValue: mockUserRepo },
        { provide: 'IAddressRepository', useValue: {} },
        { provide: 'BlockedUserRepository', useValue: {} },
        { provide: 'UserReportRepository', useValue: {} },
        { provide: 'AppointmentRepository', useValue: {} },
        { provide: 'FavoriteRepository', useValue: {} },
        { provide: StorageService, useValue: mockStorageService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should upload avatar and update user', async () => {
    const userId = 'user-1';
    const file = { buffer: Buffer.from('test'), originalname: 'avatar.jpg', size: 4 };
    const user = new User();
    user.id = userId;

    mockUserRepo.findById.mockResolvedValue(user);
    mockStorageService.uploadImage.mockResolvedValue({ url: 'https://example.com/avatar.jpg' });

    const result = await service.uploadProfilePicture(userId, file);

    expect(result.success).toBe(true);
    expect(result.profilePictureUrl).toBe('https://example.com/avatar.jpg');
    expect(user.profilePictureUrl).toBe('https://example.com/avatar.jpg');
    expect(mockUserRepo.save).toHaveBeenCalledWith(user);
  });
});
