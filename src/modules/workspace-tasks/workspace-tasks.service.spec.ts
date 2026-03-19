import { Test, TestingModule } from '@nestjs/testing';
import { WorkspaceTasksService } from './workspace-tasks.service';
import { WorkspaceTasksRepository } from './workspace-tasks.repository';
import { PrismaService } from '../../prisma/prisma.service';

describe('WorkspaceTasksService', () => {
  let service: WorkspaceTasksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspaceTasksService,
        {
          provide: WorkspaceTasksRepository,
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

    service = module.get<WorkspaceTasksService>(WorkspaceTasksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
