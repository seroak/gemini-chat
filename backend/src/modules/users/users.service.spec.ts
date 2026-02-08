import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  const mockRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('이메일이 중복되면 ConflictException을 던진다', async () => {
      // Arrange
      const createUserDto = {
        email: 'test@example.com',
        password: 'password123',
        name: '테스트',
      };
      mockRepository.findOne.mockResolvedValue({ id: '1', email: 'test@example.com' });

      // Act & Assert
      await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
    });

    it('비밀번호를 해싱하여 사용자를 생성한다', async () => {
      // Arrange
      const createUserDto = {
        email: 'test@example.com',
        password: 'password123',
        name: '테스트',
      };
      const hashedPassword = 'hashedPassword';
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue({
        ...createUserDto,
        password: hashedPassword,
      });
      mockRepository.save.mockResolvedValue({
        id: '1',
        ...createUserDto,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      jest.spyOn(bcrypt, 'hash').mockImplementation(async () => hashedPassword);

      // Act
      const result = await service.create(createUserDto);

      // Assert
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
      expect(mockRepository.create).toHaveBeenCalledWith({
        email: createUserDto.email,
        password: hashedPassword,
        name: createUserDto.name,
      });
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result.password).toBe(hashedPassword);
    });
  });

  describe('findByEmail', () => {
    it('이메일로 사용자를 찾는다', async () => {
      // Arrange
      const email = 'test@example.com';
      const user = {
        id: '1',
        email,
        name: '테스트',
        password: 'hashedPassword',
      };
      mockRepository.findOne.mockResolvedValue(user);

      // Act
      const result = await service.findByEmail(email);

      // Assert
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { email } });
      expect(result).toEqual(user);
    });

    it('사용자가 없으면 null을 반환한다', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValue(null);

      // Act
      const result = await service.findByEmail('nonexistent@example.com');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('ID로 사용자를 찾는다', async () => {
      // Arrange
      const userId = '1';
      const user = {
        id: userId,
        email: 'test@example.com',
        name: '테스트',
      };
      mockRepository.findOne.mockResolvedValue(user);

      // Act
      const result = await service.findById(userId);

      // Assert
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(result).toEqual(user);
    });

    it('사용자가 없으면 NotFoundException을 던진다', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
