import { Test, TestingModule } from '@nestjs/testing';
import { ResumesService } from './resumes.service';
import { ResumesRepository } from './resumes.repository';
import { NotFoundException } from '@nestjs/common';
import { CreateResumeDto } from './dto/create-resume.dto';

describe('ResumesService', () => {
  let service: ResumesService;
  let repository: ResumesRepository;

  const mockUser = {
    sub: 'user-id-123',
    email: 'test@example.com',
    role: 'USER',
  };

  const mockResume = {
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

  const mockRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    setDefault: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResumesService,
        {
          provide: ResumesRepository,
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ResumesService>(ResumesService);
    repository = module.get<ResumesRepository>(ResumesRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should call repository create', async () => {
      const dto: CreateResumeDto = {
        title: 'New Resume',
        resumeName: 'John',
        personalInfo: {},
        education: [],
        experience: [],
      };
      mockRepository.create.mockResolvedValueOnce(mockResume);

      const result = await service.create(mockUser, dto);

      expect(repository.create).toHaveBeenCalledWith(mockUser, dto);
      expect(result).toEqual(mockResume);
    });
  });

  describe('findAll', () => {
    it('should call repository findAll', async () => {
      mockRepository.findAll.mockResolvedValueOnce([mockResume]);

      const result = await service.findAll(mockUser);

      expect(repository.findAll).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual([mockResume]);
    });
  });

  describe('findOne', () => {
    it('should return a resume if found', async () => {
      mockRepository.findOne.mockResolvedValueOnce(mockResume);

      const result = await service.findOne(mockUser, 'resume-123');

      expect(repository.findOne).toHaveBeenCalledWith(mockUser, 'resume-123');
      expect(result).toEqual(mockResume);
    });

    it('should throw NotFoundException if not found', async () => {
      mockRepository.findOne.mockResolvedValueOnce(null);

      await expect(service.findOne(mockUser, 'invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update and return the resume', async () => {
      mockRepository.update.mockResolvedValueOnce(mockResume);

      const result = await service.update(mockUser, 'resume-123', {
        title: 'Updated',
      });

      expect(repository.update).toHaveBeenCalledWith(mockUser, 'resume-123', {
        title: 'Updated',
      });
      expect(result).toEqual(mockResume);
    });

    it('should throw NotFoundException if update fails', async () => {
      mockRepository.update.mockResolvedValueOnce(null);

      await expect(
        service.update(mockUser, 'invalid-id', { title: 'Updated' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('setDefault', () => {
    it('should set default and return the resume', async () => {
      mockRepository.setDefault.mockResolvedValueOnce({
        ...mockResume,
        isDefault: true,
      });

      const result = await service.setDefault(mockUser, 'resume-123');

      expect(repository.setDefault).toHaveBeenCalledWith(
        mockUser,
        'resume-123',
      );
      expect(result.isDefault).toEqual(true);
    });

    it('should throw NotFoundException if setDefault fails', async () => {
      mockRepository.setDefault.mockResolvedValueOnce(null);

      await expect(
        service.setDefault(mockUser, 'invalid-id'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should call repository delete and return true', async () => {
      mockRepository.delete.mockResolvedValueOnce(true);

      const result = await service.remove(mockUser, 'resume-123');

      expect(repository.delete).toHaveBeenCalledWith(mockUser, 'resume-123');
      expect(result).toEqual(true);
    });

    it('should throw NotFoundException if delete fails', async () => {
      mockRepository.delete.mockResolvedValueOnce(false);

      await expect(service.remove(mockUser, 'invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
