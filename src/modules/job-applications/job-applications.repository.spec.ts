import { Test, TestingModule } from '@nestjs/testing';
import { JobApplicationsRepository } from './job-applications.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { JobApplication, JobApplicationStatus, Priority, Role, WorkMode } from '@prisma/client';

describe('JobApplicationsRepository', () => {
  let repository: JobApplicationsRepository;
  let prismaService: PrismaService;

  const mockUserPayload = { sub: 'user-id-123', email: 'test@test.com', role: Role.USER };
  const mockAdminPayload = { sub: 'admin-id-123', email: 'admin@test.com', role: Role.ADMIN };

  const mockJobApplication: JobApplication = {
    id: 'job-app-id',
    profileId: 'user-id-123',
    resumeVariantId: null,
    title: 'Software Engineer',
    company: 'Tech Corp',
    description: null,
    jobUrl: null,
    source: null,
    location: null,
    country: null,
    workMode: WorkMode.REMOTE,
    employmentType: null,
    contractType: null,
    seniorityLevel: null,
    compensationAmountMin: null,
    compensationAmountMax: null,
    compensationType: null,
    currency: null,
    benefits: null,
    status: JobApplicationStatus.SAVED,
    priority: Priority.MEDIUM,
    appliedAt: null,
    savedAt: new Date(),
    closedAt: null,
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    jobApplication: {
      create: jest.fn().mockResolvedValue(mockJobApplication),
      findMany: jest.fn().mockResolvedValue([mockJobApplication]),
      findFirst: jest.fn().mockResolvedValue(mockJobApplication),
      update: jest.fn().mockResolvedValue(mockJobApplication),
      delete: jest.fn().mockResolvedValue(mockJobApplication),
      count: jest.fn().mockResolvedValue(1),
      groupBy: jest.fn().mockResolvedValue([{ status: JobApplicationStatus.SAVED, _count: { status: 1 } }]),
    },
    interview: {
      count: jest.fn().mockResolvedValue(0),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobApplicationsRepository,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    repository = module.get<JobApplicationsRepository>(JobApplicationsRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('create', () => {
    it('should create a job application', async () => {
      const createData = { title: 'Software Engineer', company: 'Tech Corp' } as any;
      const result = await repository.create(mockUserPayload, createData);

      expect(prismaService.jobApplication.create).toHaveBeenCalledWith({
        data: {
          title: 'Software Engineer',
          company: 'Tech Corp',
          profile: { connect: { id: mockUserPayload.sub } },
        },
      });
      expect(result).toEqual(mockJobApplication);
    });
  });

  describe('findAll', () => {
    it('should find all job applications for a regular user (scoped to profileId)', async () => {
      const result = await repository.findAll(mockUserPayload);

      expect(prismaService.jobApplication.findMany).toHaveBeenCalledWith({
        where: { profileId: mockUserPayload.sub },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual([mockJobApplication]);
    });

    it('should find all job applications without scope if admin', async () => {
      const result = await repository.findAll(mockAdminPayload);

      expect(prismaService.jobApplication.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual([mockJobApplication]);
    });
  });

  describe('findOne', () => {
    it('should find one job application', async () => {
      const result = await repository.findOne(mockUserPayload, 'job-app-id');

      expect(prismaService.jobApplication.findFirst).toHaveBeenCalledWith({
        where: { id: 'job-app-id', profileId: mockUserPayload.sub },
      });
      expect(result).toEqual(mockJobApplication);
    });
  });

  describe('update', () => {
    it('should update a job application if it exists and belongs to user', async () => {
      const updateData = { title: 'Frontend Engineer' };
      const result = await repository.update(mockUserPayload, 'job-app-id', updateData);

      expect(prismaService.jobApplication.findFirst).toHaveBeenCalledWith({
        where: { id: 'job-app-id', profileId: mockUserPayload.sub },
      });
      expect(prismaService.jobApplication.update).toHaveBeenCalledWith({
        where: { id: 'job-app-id' },
        data: updateData,
      });
      expect(result).toEqual(mockJobApplication);
    });

    it('should return null if job application does not exist or belong to user', async () => {
      jest.spyOn(prismaService.jobApplication, 'findFirst').mockResolvedValueOnce(null);
      const updateData = { title: 'Frontend Engineer' };
      const result = await repository.update(mockUserPayload, 'job-app-id', updateData);

      expect(result).toBeNull();
      expect(prismaService.jobApplication.update).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete a job application', async () => {
      const result = await repository.delete(mockUserPayload, 'job-app-id');

      expect(prismaService.jobApplication.delete).toHaveBeenCalledWith({
        where: { id: 'job-app-id' },
      });
      expect(result).toBe(true);
    });

    it('should return false if job application does not exist or belong to user', async () => {
      jest.spyOn(prismaService.jobApplication, 'findFirst').mockResolvedValueOnce(null);
      const result = await repository.delete(mockUserPayload, 'job-app-id');

      expect(result).toBe(false);
      expect(prismaService.jobApplication.delete).not.toHaveBeenCalled();
    });
  });
});
