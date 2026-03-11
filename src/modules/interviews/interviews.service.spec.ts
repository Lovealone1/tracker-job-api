import { Test, TestingModule } from '@nestjs/testing';
import { InterviewsService } from './interviews.service';
import { InterviewsRepository } from './interviews.repository';
import { NotFoundException } from '@nestjs/common';
import { InterviewType, InterviewStatus } from '@prisma/client';

describe('InterviewsService', () => {
  let service: InterviewsService;
  let repository: InterviewsRepository;

  const mockUser = {
    sub: 'user-id-123',
    email: 'test@example.com',
    role: 'USER',
  };

  const mockInterview = {
    id: 'interview-123',
    jobApplicationId: 'job-123',
    profileId: 'user-id-123',
    type: InterviewType.TECHNICAL,
    status: InterviewStatus.SCHEDULED,
    scheduledAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findUpcoming: jest.fn(),
    findAllByJobApplication: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InterviewsService,
        {
          provide: InterviewsRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<InterviewsService>(InterviewsService);
    repository = module.get<InterviewsRepository>(InterviewsRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return interview if found', async () => {
      mockRepository.findOne.mockResolvedValueOnce(mockInterview);

      const result = await service.findOne(mockUser, 'interview-123');

      expect(repository.findOne).toHaveBeenCalledWith(mockUser, 'interview-123');
      expect(result).toEqual(mockInterview);
    });

    it('should throw NotFoundException if not found', async () => {
      mockRepository.findOne.mockResolvedValueOnce(null);

      await expect(service.findOne(mockUser, 'invalid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateStatus', () => {
    it('should map dto correctly to repository.update', async () => {
      mockRepository.update.mockResolvedValueOnce({
        ...mockInterview,
        status: InterviewStatus.CANCELED,
      });

      const result = await service.updateStatus(mockUser, 'interview-123', {
        status: InterviewStatus.CANCELED,
      });

      expect(repository.update).toHaveBeenCalledWith(mockUser, 'interview-123', {
        status: InterviewStatus.CANCELED,
      });
      expect(result.status).toEqual(InterviewStatus.CANCELED);
    });
  });

  describe('remove', () => {
    it('should call repository.delete and return true', async () => {
      mockRepository.delete.mockResolvedValueOnce(true);

      const result = await service.remove(mockUser, 'interview-123');

      expect(repository.delete).toHaveBeenCalledWith(mockUser, 'interview-123');
      expect(result).toEqual(true);
    });

    it('should throw NotFoundException if delete fails', async () => {
      mockRepository.delete.mockResolvedValueOnce(false);

      await expect(service.remove(mockUser, 'invalid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
