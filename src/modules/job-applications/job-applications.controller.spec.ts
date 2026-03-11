import { Test, TestingModule } from '@nestjs/testing';
import { JobApplicationsController } from './job-applications.controller';
import { JobApplicationsService } from './job-applications.service';
import { JobApplicationStatus, Role } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';

describe('JobApplicationsController', () => {
  let controller: JobApplicationsController;
  let service: JobApplicationsService;

  const mockUserPayload = { sub: 'user-id-123', email: 'test@test.com', role: Role.USER };

  const mockJobApplication = {
    id: 'job-app-id',
    title: 'Software Engineer',
    company: 'Tech Corp',
    profileId: 'user-id-123',
  };

  const mockService = {
    create: jest.fn().mockResolvedValue(mockJobApplication),
    findAll: jest.fn().mockResolvedValue([mockJobApplication]),
    findOne: jest.fn().mockResolvedValue(mockJobApplication),
    update: jest.fn().mockResolvedValue(mockJobApplication),
    updateStatus: jest.fn().mockResolvedValue(mockJobApplication),
    updateNotes: jest.fn().mockResolvedValue(mockJobApplication),
    updatePriority: jest.fn().mockResolvedValue(mockJobApplication),
    updateResumeVariant: jest.fn().mockResolvedValue(mockJobApplication),
    remove: jest.fn().mockResolvedValue({ success: true }),
    getSummary: jest.fn().mockResolvedValue({ totalApplications: 1 }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobApplicationsController],
      providers: [
        { provide: JobApplicationsService, useValue: mockService },
      ],
    })
      .overrideGuard(JwtAuthGuard).useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(RolesGuard).useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<JobApplicationsController>(JobApplicationsController);
    service = module.get<JobApplicationsService>(JobApplicationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a job application', async () => {
      const dto = { title: 'Software Engineer', company: 'Tech Corp' };
      const result = await controller.create(mockUserPayload, dto);
      expect(service.create).toHaveBeenCalledWith(mockUserPayload, dto);
      expect(result.id).toEqual(mockJobApplication.id);
    });
  });

  describe('findAll', () => {
    it('should return an array of job applications', async () => {
      const result = await controller.findAll(mockUserPayload);
      expect(service.findAll).toHaveBeenCalledWith(mockUserPayload);
      expect(Array.isArray(result)).toBeTruthy();
      expect(result[0].id).toEqual(mockJobApplication.id);
    });
  });

  describe('findOne', () => {
    it('should return a single job application', async () => {
      const result = await controller.findOne(mockUserPayload, 'job-app-id');
      expect(service.findOne).toHaveBeenCalledWith(mockUserPayload, 'job-app-id');
      expect(result.id).toEqual(mockJobApplication.id);
    });
  });

  describe('updateStatus', () => {
    it('should update the status of a job application', async () => {
      const dto = { status: JobApplicationStatus.APPLIED };
      const result = await controller.updateStatus(mockUserPayload, 'job-app-id', dto);
      expect(service.updateStatus).toHaveBeenCalledWith(mockUserPayload, 'job-app-id', dto);
      expect(result.id).toEqual(mockJobApplication.id);
    });
  });

  describe('getSummary', () => {
    it('should return the summary representation', async () => {
      const result = await controller.getSummary(mockUserPayload);
      expect(service.getSummary).toHaveBeenCalledWith(mockUserPayload);
      expect(result.totalApplications).toBe(1);
    });
  });
});
