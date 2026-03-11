import { Test, TestingModule } from '@nestjs/testing';
import { ResumeVariantsService } from './resume-variants.service';
import { ResumeVariantsRepository } from './resume-variants.repository';
import { NotFoundException } from '@nestjs/common';
import { CreateResumeVariantDto } from './dto/create-resume-variant.dto';

describe('ResumeVariantsService', () => {
  let service: ResumeVariantsService;
  let repository: ResumeVariantsRepository;

  const mockUser = {
    sub: 'user-id-123',
    email: 'test@example.com',
    role: 'USER',
  };

  const mockResumeVariant = {
    id: 'variant-123',
    resumeId: 'resume-123',
    profileId: 'user-id-123',
    title: 'Test Variant',
    resumeName: 'John',
    personalInfo: {},
    education: [],
    experience: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResumeVariantsService,
        {
          provide: ResumeVariantsRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ResumeVariantsService>(ResumeVariantsService);
    repository = module.get<ResumeVariantsRepository>(ResumeVariantsRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should call repository.create and return the result', async () => {
      const dto: CreateResumeVariantDto = {
        resumeId: 'resume-123',
        jobApplicationId: 'job-123',
      };
      mockRepository.create.mockResolvedValueOnce(mockResumeVariant);

      const result = await service.create(mockUser, dto);

      expect(repository.create).toHaveBeenCalledWith(mockUser, dto);
      expect(result).toEqual(mockResumeVariant);
    });
  });

  describe('findAll', () => {
    it('should call repository.findAll and return an array', async () => {
      mockRepository.findAll.mockResolvedValueOnce([mockResumeVariant]);

      const result = await service.findAll(mockUser);

      expect(repository.findAll).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual([mockResumeVariant]);
    });
  });

  describe('findOne', () => {
    it('should return a specific variant if found', async () => {
      mockRepository.findOne.mockResolvedValueOnce(mockResumeVariant);

      const result = await service.findOne(mockUser, 'variant-123');

      expect(repository.findOne).toHaveBeenCalledWith(mockUser, 'variant-123');
      expect(result).toEqual(mockResumeVariant);
    });

    it('should throw NotFoundException if variant does not exist', async () => {
      mockRepository.findOne.mockResolvedValueOnce(null);

      await expect(service.findOne(mockUser, 'invalid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should return updated variant', async () => {
      mockRepository.update.mockResolvedValueOnce(mockResumeVariant);

      const result = await service.update(mockUser, 'variant-123', {
        title: 'New Title',
      });

      expect(repository.update).toHaveBeenCalledWith(mockUser, 'variant-123', {
        title: 'New Title',
      });
      expect(result).toEqual(mockResumeVariant);
    });

    it('should throw NotFoundException if update fails', async () => {
      mockRepository.update.mockResolvedValueOnce(null);

      await expect(
        service.update(mockUser, 'invalid', { title: 'New Title' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should call repository.delete and return true', async () => {
      mockRepository.delete.mockResolvedValueOnce(true);

      const result = await service.remove(mockUser, 'variant-123');

      expect(repository.delete).toHaveBeenCalledWith(mockUser, 'variant-123');
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
