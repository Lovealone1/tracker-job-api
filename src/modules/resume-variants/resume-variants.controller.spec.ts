import { Test, TestingModule } from '@nestjs/testing';
import { ResumeVariantsController } from './resume-variants.controller';
import { ResumeVariantsService } from './resume-variants.service';
import { CreateResumeVariantDto } from './dto/create-resume-variant.dto';
import { UpdateResumeVariantDto } from './dto/update-resume-variant.dto';
import { RolesGuard } from '../../auth/guards/roles.guard';

describe('ResumeVariantsController', () => {
  let controller: ResumeVariantsController;
  let service: ResumeVariantsService;

  const mockUser = {
    sub: 'user-id-123',
    email: 'test@example.com',
    role: 'USER',
  };

  const mockResumeVariant = {
    id: 'variant-123',
    resumeId: 'resume-123',
    jobApplicationId: 'job-123',
    title: 'Variant Title',
    resumeName: 'John',
    personalInfo: {},
    education: [],
    experience: [],
    generatedWithAI: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResumeVariantsController],
      providers: [
        {
          provide: ResumeVariantsService,
          useValue: mockService,
        },
      ],
    })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ResumeVariantsController>(ResumeVariantsController);
    service = module.get<ResumeVariantsService>(ResumeVariantsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new variant', async () => {
      const dto: CreateResumeVariantDto = {
        resumeId: 'resume-123',
        jobApplicationId: 'job-123',
      };
      mockService.create.mockResolvedValueOnce(mockResumeVariant);

      const result = await controller.create(mockUser, dto);

      expect(service.create).toHaveBeenCalledWith(mockUser, dto);
      expect(result.id).toEqual(mockResumeVariant.id);
    });
  });

  describe('findAll', () => {
    it('should list all user variants', async () => {
      mockService.findAll.mockResolvedValueOnce([mockResumeVariant]);

      const result = await controller.findAll(mockUser);

      expect(service.findAll).toHaveBeenCalledWith(mockUser);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('findOne', () => {
    it('should get a specific variant', async () => {
      mockService.findOne.mockResolvedValueOnce(mockResumeVariant);

      const result = await controller.findOne(mockUser, 'variant-123');

      expect(service.findOne).toHaveBeenCalledWith(mockUser, 'variant-123');
      expect(result.id).toEqual(mockResumeVariant.id);
    });
  });

  describe('update', () => {
    it('should update and return a variant', async () => {
      const dto: UpdateResumeVariantDto = { title: 'Updated' };
      mockService.update.mockResolvedValueOnce({
        ...mockResumeVariant,
        title: 'Updated',
      });

      const result = await controller.update(mockUser, 'variant-123', dto);

      expect(service.update).toHaveBeenCalledWith(mockUser, 'variant-123', dto);
      expect(result.title).toEqual('Updated');
    });
  });

  describe('remove', () => {
    it('should delete a variant', async () => {
      mockService.remove.mockResolvedValueOnce(true);

      const result = await controller.remove(mockUser, 'variant-123');

      expect(service.remove).toHaveBeenCalledWith(mockUser, 'variant-123');
      expect(result.message).toEqual('Resume variant deleted successfully');
    });
  });
});
