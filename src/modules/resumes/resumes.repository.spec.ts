import { Test, TestingModule } from '@nestjs/testing';
import { ResumesRepository } from './resumes.repository';
import { PrismaService } from '../../prisma/prisma.service';

describe('ResumesRepository', () => {
  let repository: ResumesRepository;
  let prisma: PrismaService;

  const mockUser = {
    sub: 'user-id-123',
    email: 'test@example.com',
    role: 'USER',
  };

  const mockAdminUser = {
    sub: 'admin-id-456',
    email: 'admin@example.com',
    role: 'ADMIN',
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

  const mockPrismaService = {
    resume: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResumesRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<ResumesRepository>(ResumesRepository);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create a standard resume without transaction if isDefault is false', async () => {
      const data = {
        title: 'New',
        resumeName: 'John',
        personalInfo: {},
        education: [],
        experience: [],
      };
      mockPrismaService.resume.create.mockResolvedValueOnce(mockResume);

      const result = await repository.create(mockUser, data as any);

      expect(prisma.resume.create).toHaveBeenCalledWith({
        data: {
          ...data,
          profileId: mockUser.sub,
        },
      });
      expect(result).toEqual(mockResume);
    });
  });

  describe('findAll', () => {
    it('should retrieve resumes only for the user ID if role is USER', async () => {
      mockPrismaService.resume.findMany.mockResolvedValueOnce([mockResume]);

      await repository.findAll(mockUser);

      expect(prisma.resume.findMany).toHaveBeenCalledWith({
        where: { profileId: mockUser.sub },
        orderBy: { updatedAt: 'desc' },
      });
    });

    it('should retrieve all resumes without ID filter if role is ADMIN', async () => {
      mockPrismaService.resume.findMany.mockResolvedValueOnce([mockResume]);

      await repository.findAll(mockAdminUser);

      expect(prisma.resume.findMany).toHaveBeenCalledWith({
        where: undefined,
        orderBy: { updatedAt: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should retrieve a resume checking both ID and profileId for USER role', async () => {
      mockPrismaService.resume.findFirst.mockResolvedValueOnce(mockResume);

      await repository.findOne(mockUser, 'resume-123');

      expect(prisma.resume.findFirst).toHaveBeenCalledWith({
        where: { id: 'resume-123', profileId: mockUser.sub },
      });
    });

    it('should retrieve a resume checking only ID for ADMIN role', async () => {
      mockPrismaService.resume.findFirst.mockResolvedValueOnce(mockResume);

      await repository.findOne(mockAdminUser, 'resume-123');

      expect(prisma.resume.findFirst).toHaveBeenCalledWith({
        where: { id: 'resume-123' },
      });
    });
  });

  describe('update', () => {
    it('should update a resume if found based on isolation rules', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(mockResume as any);
      mockPrismaService.resume.update.mockResolvedValueOnce({
        ...mockResume,
        title: 'Updated',
      });

      const result = await repository.update(mockUser, 'resume-123', {
        title: 'Updated',
      });

      expect(repository.findOne).toHaveBeenCalledWith(mockUser, 'resume-123');
      expect(prisma.resume.update).toHaveBeenCalledWith({
        where: { id: 'resume-123' },
        data: { title: 'Updated' },
      });
      expect(result?.title).toEqual('Updated');
    });

    it('should return null if trying to update an inaccessible resume', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);

      const result = await repository.update(mockUser, 'resume-123', {
        title: 'Updated',
      });

      expect(result).toBeNull();
      expect(prisma.resume.update).not.toHaveBeenCalled();
    });
  });

  describe('setDefault', () => {
    it('should remove default from others and set it on the target using a transaction', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(mockResume as any);
      mockPrismaService.resume.update.mockResolvedValueOnce({
        ...mockResume,
        isDefault: true,
      });
      mockPrismaService.resume.updateMany.mockResolvedValueOnce({ count: 1 });

      const result = await repository.setDefault(mockUser, 'resume-123');

      expect(prisma.resume.updateMany).toHaveBeenCalledWith({
        where: { profileId: mockUser.sub, isDefault: true, id: { not: 'resume-123' } },
        data: { isDefault: false },
      });
      expect(prisma.resume.update).toHaveBeenCalledWith({
        where: { id: 'resume-123' },
        data: { isDefault: true },
      });
      expect(result?.isDefault).toBe(true);
    });
  });

  describe('delete', () => {
    it('should delete a non-default resume, returning true', async () => {
      const nonDefaultResume = { ...mockResume, isDefault: false };
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(nonDefaultResume as any);
      mockPrismaService.resume.delete.mockResolvedValueOnce(nonDefaultResume);

      const result = await repository.delete(mockUser, 'resume-123');

      expect(prisma.resume.delete).toHaveBeenCalledWith({
        where: { id: 'resume-123' },
      });
      expect(result).toBe(true);
    });

    it('should delete a default resume and assign the next most recent one as default', async () => {
      const defaultResume = { ...mockResume, isDefault: true };
      const nextResume = { ...mockResume, id: 'resume-456', isDefault: false };
      
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(defaultResume as any);
      mockPrismaService.resume.findFirst.mockResolvedValueOnce(nextResume);
      mockPrismaService.resume.delete.mockResolvedValueOnce(defaultResume);
      mockPrismaService.resume.update.mockResolvedValueOnce({ ...nextResume, isDefault: true });

      const result = await repository.delete(mockUser, 'resume-123');

      expect(prisma.resume.findFirst).toHaveBeenCalledWith({
        where: { profileId: mockUser.sub, id: { not: 'resume-123' } },
        orderBy: { createdAt: 'desc' },
      });
      // The transaction callback provides the mocked tx, so we expect the delete and update on tx
      expect(prisma.resume.delete).toHaveBeenCalledWith({
        where: { id: 'resume-123' },
      });
      expect(prisma.resume.update).toHaveBeenCalledWith({
        where: { id: 'resume-456' },
        data: { isDefault: true },
      });
      expect(result).toBe(true);
    });

    it('should return false if resume is not accessible to delete', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);

      const result = await repository.delete(mockUser, 'resume-123');

      expect(prisma.resume.delete).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });
});
