import { Test, TestingModule } from '@nestjs/testing';
import { InterviewsRepository } from './interviews.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { InterviewType, InterviewStatus } from '@prisma/client';

describe('InterviewsRepository', () => {
  let repository: InterviewsRepository;
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

  const mockJobApp = {
    id: 'job-123',
    profileId: 'user-id-123',
    title: 'Software Engineer',
  };

  const mockInterview = {
    id: 'interview-123',
    jobApplicationId: 'job-123',
    profileId: 'user-id-123',
    type: InterviewType.TECHNICAL,
    status: InterviewStatus.SCHEDULED,
    scheduledAt: new Date(),
  };

  const mockPrismaService = {
    jobApplication: {
      findFirst: jest.fn(),
    },
    interview: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InterviewsRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<InterviewsRepository>(InterviewsRepository);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create interview if job application belongs to user', async () => {
      mockPrismaService.jobApplication.findFirst.mockResolvedValueOnce(mockJobApp);
      mockPrismaService.interview.create.mockResolvedValueOnce(mockInterview);

      const result = await repository.create(mockUser, {
        jobApplicationId: 'job-123',
        type: InterviewType.TECHNICAL,
        scheduledAt: mockInterview.scheduledAt,
      });

      expect(prisma.jobApplication.findFirst).toHaveBeenCalledWith({
        where: { id: 'job-123', profileId: mockUser.sub },
      });
      expect(prisma.interview.create).toHaveBeenCalled();
      expect(result).toEqual(mockInterview);
    });

    it('should throw NotFoundException if job application not found', async () => {
      mockPrismaService.jobApplication.findFirst.mockResolvedValueOnce(null);

      await expect(
        repository.create(mockUser, {
          jobApplicationId: 'invalid',
          type: InterviewType.TECHNICAL,
          scheduledAt: new Date(),
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should fetch user interviews and include job application data', async () => {
      mockPrismaService.interview.findMany.mockResolvedValueOnce([mockInterview]);

      await repository.findAll(mockUser);

      expect(prisma.interview.findMany).toHaveBeenCalledWith({
        where: { profileId: mockUser.sub },
        orderBy: { scheduledAt: 'asc' },
        include: { jobApplication: { select: expect.any(Object) } },
      });
    });

    it('should fetch all without profile scope for ADMIN', async () => {
      mockPrismaService.interview.findMany.mockResolvedValueOnce([mockInterview]);

      await repository.findAll(mockAdminUser);

      expect(prisma.interview.findMany).toHaveBeenCalledWith({
        where: undefined,
        orderBy: { scheduledAt: 'asc' },
        include: expect.any(Object),
      });
    });
  });

  describe('findUpcoming', () => {
    it('should find upcoming scheduled interviews within 14 days', async () => {
      mockPrismaService.interview.findMany.mockResolvedValueOnce([mockInterview]);

      await repository.findUpcoming(mockUser);

      expect(prisma.interview.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            profileId: mockUser.sub,
            status: 'SCHEDULED',
            scheduledAt: expect.objectContaining({
              gte: expect.any(Date),
              lte: expect.any(Date),
            }),
          }),
        }),
      );
    });
  });

  describe('findAllByJobApplication', () => {
    it('should find interviews given a valid job app id belonging to user', async () => {
      mockPrismaService.jobApplication.findFirst.mockResolvedValueOnce(mockJobApp);
      mockPrismaService.interview.findMany.mockResolvedValueOnce([mockInterview]);

      await repository.findAllByJobApplication(mockUser, 'job-123');

      expect(prisma.jobApplication.findFirst).toHaveBeenCalledWith({
        where: { id: 'job-123', profileId: mockUser.sub },
      });
      expect(prisma.interview.findMany).toHaveBeenCalledWith({
        where: { jobApplicationId: 'job-123' },
        orderBy: { scheduledAt: 'asc' },
      });
    });

    it('should throw if job app is not accessible', async () => {
      mockPrismaService.jobApplication.findFirst.mockResolvedValueOnce(null);

      await expect(repository.findAllByJobApplication(mockUser, 'job-123')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('should find an interview considering user scope', async () => {
      mockPrismaService.interview.findFirst.mockResolvedValueOnce(mockInterview);

      await repository.findOne(mockUser, 'interview-123');

      expect(prisma.interview.findFirst).toHaveBeenCalledWith({
        where: { id: 'interview-123', profileId: mockUser.sub },
        include: expect.any(Object),
      });
    });
  });

  describe('update', () => {
    it('should update if the interview is accessible', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(mockInterview as any);
      mockPrismaService.interview.update.mockResolvedValueOnce({
        ...mockInterview,
        notes: 'new notes',
      });

      const result = await repository.update(mockUser, 'interview-123', {
        notes: 'new notes',
      });

      expect(prisma.interview.update).toHaveBeenCalledWith({
        where: { id: 'interview-123' },
        data: { notes: 'new notes' },
      });
      expect(result?.notes).toEqual('new notes');
    });

    it('should return null if trying to update an inaccessible interview', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);

      const result = await repository.update(mockUser, 'interview-123', { notes: 'hi' });

      expect(result).toBeNull();
      expect(prisma.interview.update).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete if the interview is accessible', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(mockInterview as any);
      mockPrismaService.interview.delete.mockResolvedValueOnce(mockInterview);

      const result = await repository.delete(mockUser, 'interview-123');

      expect(prisma.interview.delete).toHaveBeenCalledWith({
        where: { id: 'interview-123' },
      });
      expect(result).toBe(true);
    });

    it('should return false if trying to delete an inaccessible interview', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);

      const result = await repository.delete(mockUser, 'interview-123');

      expect(result).toBe(false);
      expect(prisma.interview.delete).not.toHaveBeenCalled();
    });
  });
});
