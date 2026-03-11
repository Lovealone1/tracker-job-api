import { Test, TestingModule } from '@nestjs/testing';
import { InterviewsController } from './interviews.controller';
import { InterviewsService } from './interviews.service';
import { CreateInterviewDto } from './dto/create-interview.dto';
import {
  UpdateInterviewDto,
  UpdateInterviewStatusDto,
  RescheduleInterviewDto,
} from './dto/update-interview.dto';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { InterviewType, InterviewStatus } from '@prisma/client';

describe('InterviewsController', () => {
  let controller: InterviewsController;
  let service: InterviewsService;

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
    jobApplication: { title: 'Engineer', company: 'Tech Inc' },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findUpcoming: jest.fn(),
    findAllByJobApplication: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    updateStatus: jest.fn(),
    updateNotes: jest.fn(),
    updateFeedback: jest.fn(),
    reschedule: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InterviewsController],
      providers: [
        {
          provide: InterviewsService,
          useValue: mockService,
        },
      ],
    })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<InterviewsController>(InterviewsController);
    service = module.get<InterviewsService>(InterviewsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an interview', async () => {
      const dto: CreateInterviewDto = {
        jobApplicationId: 'job-123',
        type: InterviewType.TECHNICAL,
        scheduledAt: new Date(),
      };
      mockService.create.mockResolvedValueOnce(mockInterview);

      const result = await controller.create(mockUser, dto);

      expect(service.create).toHaveBeenCalledWith(mockUser, dto);
      expect(result.id).toEqual(mockInterview.id);
    });
  });

  describe('findAll', () => {
    it('should list all interviews', async () => {
      mockService.findAll.mockResolvedValueOnce([mockInterview]);

      const result = await controller.findAll(mockUser);

      expect(service.findAll).toHaveBeenCalledWith(mockUser);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('findUpcoming', () => {
    it('should list upcoming interviews', async () => {
      mockService.findUpcoming.mockResolvedValueOnce([mockInterview]);

      const result = await controller.findUpcoming(mockUser);

      expect(service.findUpcoming).toHaveBeenCalledWith(mockUser);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('findAllByJobApplication', () => {
    it('should list specific job interviews', async () => {
      mockService.findAllByJobApplication.mockResolvedValueOnce([mockInterview]);

      const result = await controller.findAllByJobApplication(mockUser, 'job-123');

      expect(service.findAllByJobApplication).toHaveBeenCalledWith(mockUser, 'job-123');
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('updateStatus', () => {
    it('should update status', async () => {
      const dto: UpdateInterviewStatusDto = { status: InterviewStatus.COMPLETED };
      mockService.updateStatus.mockResolvedValueOnce({ ...mockInterview, status: InterviewStatus.COMPLETED });

      const result = await controller.updateStatus(mockUser, 'interview-123', dto);

      expect(service.updateStatus).toHaveBeenCalledWith(mockUser, 'interview-123', dto);
      expect(result.status).toEqual(InterviewStatus.COMPLETED);
    });
  });

  describe('reschedule', () => {
    it('should reschedule an interview', async () => {
      const date = new Date();
      const dto: RescheduleInterviewDto = { scheduledAt: date, timezone: 'UTC' };
      mockService.reschedule.mockResolvedValueOnce({ ...mockInterview, scheduledAt: date });

      const result = await controller.reschedule(mockUser, 'interview-123', dto);

      expect(service.reschedule).toHaveBeenCalledWith(mockUser, 'interview-123', dto);
    });
  });
});
