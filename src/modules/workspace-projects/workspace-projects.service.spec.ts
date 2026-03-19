import { Test, TestingModule } from '@nestjs/testing';
import { WorkspaceProjectsService } from './workspace-projects.service';
import { WorkspaceProjectsRepository } from './workspace-projects.repository';
import { PrismaService } from '../../prisma/prisma.service';

describe('WorkspaceProjectsService', () => {
  let service: WorkspaceProjectsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspaceProjectsService,
        {
          provide: WorkspaceProjectsRepository,
          useValue: {
            findAll: jest.fn().mockResolvedValue([[], 0]),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<WorkspaceProjectsService>(WorkspaceProjectsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
