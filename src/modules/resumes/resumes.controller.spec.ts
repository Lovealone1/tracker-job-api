import { Test, TestingModule } from '@nestjs/testing';
import { ResumesController } from './resumes.controller';
import { ResumesService } from './resumes.service';
import { CreateResumeDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { RolesGuard } from '../../auth/guards/roles.guard';

describe('ResumesController', () => {
  let controller: ResumesController;
  let service: ResumesService;

  const mockUser = {
    sub: 'user-id-123',
    email: 'test@example.com',
    role: 'USER',
  };

  const mockResumeResponse = {
    id: 'resume-123',
    profileId: 'user-id-123',
    title: 'Test Resume',
    resumeName: 'John Doe',
    isDefault: false,
    personalInfo: {},
    education: [],
    experience: [],
    projects: [],
    skills: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockResumesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    setDefault: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResumesController],
      providers: [
        {
          provide: ResumesService,
          useValue: mockResumesService,
        },
      ],
    })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ResumesController>(ResumesController);
    service = module.get<ResumesService>(ResumesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new resume', async () => {
      const dto: CreateResumeDto = {
        title: 'My CV',
        resumeName: 'John Doe',
        personalInfo: {},
        education: [],
        experience: [],
      };

      mockResumesService.create.mockResolvedValueOnce(mockResumeResponse);

      const result = await controller.create(mockUser, dto);

      expect(service.create).toHaveBeenCalledWith(mockUser, dto);
      expect(result.id).toEqual(mockResumeResponse.id);
    });
  });

  describe('findAll', () => {
    it('should list all user resumes', async () => {
      mockResumesService.findAll.mockResolvedValueOnce([mockResumeResponse]);

      const result = await controller.findAll(mockUser);

      expect(service.findAll).toHaveBeenCalledWith(mockUser);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('findOne', () => {
    it('should return a specific resume', async () => {
      mockResumesService.findOne.mockResolvedValueOnce(mockResumeResponse);

      const result = await controller.findOne(mockUser, 'resume-123');

      expect(service.findOne).toHaveBeenCalledWith(mockUser, 'resume-123');
      expect(result.id).toEqual(mockResumeResponse.id);
    });
  });

  describe('update', () => {
    it('should update a resume', async () => {
      const updateDto: UpdateResumeDto = { title: 'Updated Resume' };
      mockResumesService.update.mockResolvedValueOnce({
        ...mockResumeResponse,
        ...updateDto,
      });

      const result = await controller.update(mockUser, 'resume-123', updateDto);

      expect(service.update).toHaveBeenCalledWith(
        mockUser,
        'resume-123',
        updateDto,
      );
      expect(result.title).toEqual('Updated Resume');
    });
  });

  describe('setDefault', () => {
    it('should set a resume as default', async () => {
      mockResumesService.setDefault.mockResolvedValueOnce({
        ...mockResumeResponse,
        isDefault: true,
      });

      const result = await controller.setDefault(mockUser, 'resume-123');

      expect(service.setDefault).toHaveBeenCalledWith(mockUser, 'resume-123');
      expect(result.isDefault).toBe(true);
    });
  });

  describe('remove', () => {
    it('should remove a resume', async () => {
      mockResumesService.remove.mockResolvedValueOnce(true);

      const result = await controller.remove(mockUser, 'resume-123');

      expect(service.remove).toHaveBeenCalledWith(mockUser, 'resume-123');
      expect(result).toEqual({ message: 'Resume deleted successfully' });
    });
  });
});
