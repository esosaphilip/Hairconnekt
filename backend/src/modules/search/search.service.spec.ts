import { Test, TestingModule } from '@nestjs/testing';
import { SearchService } from './search.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProviderProfile } from '../providers/entities/provider-profile.entity';
import { User } from '../users/entities/user.entity';
import { Service } from '../services/entities/service.entity';
import { Review } from '../reviews/entities/review.entity';
import { ServiceCategory } from '../services/entities/service-category.entity';
import { Repository } from 'typeorm';

// Mock TypeORM QueryBuilder
const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    distinct: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([]),
    getSql: jest.fn().mockReturnValue('SELECT * FROM providers'), // Mock getSql
};

describe('SearchService', () => {
    let service: SearchService;
    let providerRepo: Repository<ProviderProfile>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SearchService,
                {
                    provide: getRepositoryToken(ProviderProfile),
                    useValue: {
                        createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
                    },
                },
                {
                    provide: getRepositoryToken(User),
                    useValue: {},
                },
                {
                    provide: getRepositoryToken(Service),
                    useValue: {},
                },
                {
                    provide: getRepositoryToken(Review),
                    useValue: {
                        createQueryBuilder: jest.fn().mockReturnValue({
                            select: jest.fn().mockReturnThis(),
                            addSelect: jest.fn().mockReturnThis(),
                            where: jest.fn().mockReturnThis(),
                            groupBy: jest.fn().mockReturnThis(),
                            getRawMany: jest.fn().mockResolvedValue([]),
                        })
                    },
                },
                {
                    provide: getRepositoryToken(ServiceCategory),
                    useValue: {
                        findOne: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<SearchService>(SearchService);
        providerRepo = module.get<Repository<ProviderProfile>>(getRepositoryToken(ProviderProfile));

        // Clear mocks before each test
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('search', () => {
        it('should include service name in the query when a search term is provided', async () => {
            const searchTerm = 'Braids';
            await service.search({ query: searchTerm });

            // Verify QueryBuilder creation
            expect(providerRepo.createQueryBuilder).toHaveBeenCalledWith('p');

            // Verify joins
            expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('p.user', 'u');
            // THIS IS THE KEY TEST: Verify we join services for searching
            expect(mockQueryBuilder.leftJoin).toHaveBeenCalledWith('p.services', 's_search');

            // Verify WHERE clause includes service name search
            const whereCall = mockQueryBuilder.where.mock.calls[0];
            const whereClause = whereCall[0] as string;
            const whereParams = whereCall[1];

            // Check for LOWER(s_search.name) LIKE :filterLower
            expect(whereClause).toContain('LOWER(s_search.name) LIKE :filterLower');
            expect(whereParams).toEqual({ filterLower: `%${searchTerm.toLowerCase()}%` });
        });

        it('should return empty results if query is empty and no category provided', async () => {
            const result = await service.search({ query: '' });
            expect(result).toEqual({ results: [] });
            expect(providerRepo.createQueryBuilder).not.toHaveBeenCalled();
        });
    });
});
