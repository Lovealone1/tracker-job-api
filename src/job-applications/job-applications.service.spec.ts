import { Test, TestingModule } from '@nestjs/testing';
import { JobApplicationsService } from './job-applications.service';
import { JobApplicationsRepository } from './job-applications.repository';
import { NotFoundException } from '@nestjs/common';
import { JobApplicationStatus, Priority, Role } from '@prisma/client';

describe('JobApplicationsService', () => {
  let service: JobApplicationsService;
  let repository: JobApplicationsRepository;

  const mockUserPayload = { sub: 'user-id-123', email: 'test@test.com', role: Role.USER };

  const mockJobApplication = {
    id: 'job-app-id',
    title: 'Software Engineer',
    company: 'Tech Corp',
    profileId: 'user-id-123',
    status: JobApplicationStatus.SAVED,
  };

  const mockRepository = {
    create: jest.fn().mockResolvedValue(mockJobApplication),
    findAll: jest.fn().mockResolvedValue([mockJobApplication]),
    findOne: jest.fn().mockResolvedValue(mockJobApplication),
    update: jest.fn().mockResolvedValue(mockJobApplication),
    delete: jest.fn().mockResolvedValue(true),
    getSummary: jest.fn().mockResolvedValue({
      totalApplications: 1,
      statusGroups: [{ status: JobApplicationStatus.SAVED, _count: { status: 1 } }],
      workModeGroups: [],
      appliedThisWeek: 0,
      appliedThisMonth: 0,
      upcomingInterviewsCount: 0,
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobApplicationsService,
        { provide: JobApplicationsRepository, useValue: mockRepository },
      ],
    }).compile();

    service = module.get<JobApplicationsService>(JobApplicationsService);
    repository = module.get<JobApplicationsRepository>(JobApplicationsRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a job application if it exists', async () => {
      const result = await service.findOne(mockUserPayload, 'job-app-id');
      expect(result).toEqual(mockJobApplication);
    });

    it('should throw NotFoundException if job application does not exist', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      await expect(service.findOne(mockUserPayload, 'invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    it('should update the status', async () => {
      const dto = { status: JobApplicationStatus.APPLIED };
      const result = await service.updateStatus(mockUserPayload, 'job-app-id', dto);
      expect(repository.update).toHaveBeenCalledWith(mockUserPayload, 'job-app-id', { status: dto.status });
      expect(result).toEqual(mockJobApplication);
    });
  });

  describe('updatePriority', () => {
    it('should update the priority', async () => {
      const dto = { priority: Priority.HIGH };
      const result = await service.updatePriority(mockUserPayload, 'job-app-id', dto);
      expect(repository.update).toHaveBeenCalledWith(mockUserPayload, 'job-app-id', { priority: dto.priority });
      expect(result).toEqual(mockJobApplication);
    });
  });

  describe('remove', () => {
    it('should remove a job application', async () => {
      const result = await service.remove(mockUserPayload, 'job-app-id');
      expect(result).toEqual({ success: true });
    });

    it('should throw NotFoundException if application not found', async () => {
      jest.spyOn(repository, 'delete').mockResolvedValue(false);
      await expect(service.remove(mockUserPayload, 'invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getSummary', () => {
    it('should return mapped summary metrics', async () => {
      const result = await service.getSummary(mockUserPayload);
      expect(result.totalApplications).toBe(1);
      expect(result.byStatus.SAVED).toBe(1);
      expect(result.byStatus.APPLIED).toBe(0);
    });
  });
});
