import { Test, TestingModule } from '@nestjs/testing';
import { ResumeVariantsRepository } from './resume-variants.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('ResumeVariantsRepository', () => {
  let repository: ResumeVariantsRepository;
  let prisma: PrismaService;

  const mockUser = {
    sub: 'user-id-123',
    email: 'test@example.com',
    role: 'USER',
  };

  const mockAdminUser = {
    sub: 'admin-123',
    email: 'admin@example.com',
    role: 'ADMIN',
  };

  const mockBaseResume = {
    id: 'resume-123',
    profileId: 'user-id-123',
    title: 'Base',
    resumeName: 'John',
    personalInfo: {},
    education: [],
    experience: [],
  };

  const mockJobApp = {
    id: 'job-123',
    profileId: 'user-id-123',
  };

  const mockResumeVariant = {
    id: 'variant-123',
    profileId: 'user-id-123',
    resumeId: 'resume-123',
    title: 'Variant',
    resumeName: 'John',
    personalInfo: {},
    education: [],
    experience: [],
  };

  const mockPrismaService = {
    resume: {
      findFirst: jest.fn(),
    },
    jobApplication: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    resumeVariant: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResumeVariantsRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<ResumeVariantsRepository>(ResumeVariantsRepository);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should copy base resume and create variant inside transaction if valid', async () => {
      mockPrismaService.resume.findFirst.mockResolvedValueOnce(mockBaseResume);
      mockPrismaService.jobApplication.findFirst.mockResolvedValueOnce(mockJobApp);
      mockPrismaService.resumeVariant.create.mockResolvedValueOnce(mockResumeVariant);

      const result = await repository.create(mockUser, {
        resumeId: 'resume-123',
        jobApplicationId: 'job-123',
      });

      expect(prisma.resume.findFirst).toHaveBeenCalledWith({
        where: { id: 'resume-123', profileId: mockUser.sub },
      });
      expect(prisma.jobApplication.findFirst).toHaveBeenCalledWith({
        where: { id: 'job-123', profileId: mockUser.sub },
      });
      // Test transaction logic
      expect(prisma.jobApplication.update).toHaveBeenCalledWith({
        where: { id: 'job-123' },
        data: { resumeVariantId: mockResumeVariant.id },
      });
      expect(result).toEqual(mockResumeVariant);
    });

    it('should throw NotFoundException if base resume does not exist or unauthorized', async () => {
      mockPrismaService.resume.findFirst.mockResolvedValueOnce(null);

      await expect(
        repository.create(mockUser, { resumeId: 'invalid', jobApplicationId: 'job-123' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if job app does not exist or unauthorized', async () => {
      mockPrismaService.resume.findFirst.mockResolvedValueOnce(mockBaseResume);
      mockPrismaService.jobApplication.findFirst.mockResolvedValueOnce(null);

      await expect(
        repository.create(mockUser, { resumeId: 'resume-123', jobApplicationId: 'invalid' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should fetch user variants only if role is USER', async () => {
      mockPrismaService.resumeVariant.findMany.mockResolvedValueOnce([mockResumeVariant]);

      await repository.findAll(mockUser);

      expect(prisma.resumeVariant.findMany).toHaveBeenCalledWith({
        where: { profileId: mockUser.sub },
        orderBy: { updatedAt: 'desc' },
        include: expect.any(Object),
      });
    });

    it('should fetch all variants if role is ADMIN', async () => {
      mockPrismaService.resumeVariant.findMany.mockResolvedValueOnce([mockResumeVariant]);

      await repository.findAll(mockAdminUser);

      expect(prisma.resumeVariant.findMany).toHaveBeenCalledWith({
        where: undefined,
        orderBy: { updatedAt: 'desc' },
        include: expect.any(Object),
      });
    });
  });

  describe('findOne', () => {
    it('should fetch a specific variant with profile id filter for USER', async () => {
      mockPrismaService.resumeVariant.findFirst.mockResolvedValueOnce(mockResumeVariant);

      await repository.findOne(mockUser, 'variant-123');

      expect(prisma.resumeVariant.findFirst).toHaveBeenCalledWith({
        where: { id: 'variant-123', profileId: mockUser.sub },
      });
    });
  });

  describe('update', () => {
    it('should update if the variant is accessible', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(mockResumeVariant as any);
      mockPrismaService.resumeVariant.update.mockResolvedValueOnce({
        ...mockResumeVariant,
        title: 'Updated Title',
      });

      const result = await repository.update(mockUser, 'variant-123', {
        title: 'Updated Title',
      });

      expect(prisma.resumeVariant.update).toHaveBeenCalledWith({
        where: { id: 'variant-123' },
        data: { title: 'Updated Title' },
      });
      expect(result?.title).toEqual('Updated Title');
    });

    it('should return null if trying to update an inaccessible variant', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);

      const result = await repository.update(mockUser, 'variant-123', {
        title: 'Updated Title',
      });

      expect(result).toBeNull();
      expect(prisma.resumeVariant.update).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete if the variant is accessible', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(mockResumeVariant as any);
      mockPrismaService.resumeVariant.delete.mockResolvedValueOnce(mockResumeVariant);

      const result = await repository.delete(mockUser, 'variant-123');

      expect(prisma.resumeVariant.delete).toHaveBeenCalledWith({
        where: { id: 'variant-123' },
      });
      expect(result).toBe(true);
    });

    it('should return false if trying to delete an inaccessible variant', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);

      const result = await repository.delete(mockUser, 'variant-123');

      expect(result).toBe(false);
      expect(prisma.resumeVariant.delete).not.toHaveBeenCalled();
    });
  });
});
