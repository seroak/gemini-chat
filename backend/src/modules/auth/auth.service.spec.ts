import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUsersService = {
    create: jest.fn(),
    findByEmail: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('새 사용자를 등록하고 JWT 토큰을 반환한다', async () => {
      // Arrange
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
        name: '테스트',
      };
      const createdUser = {
        id: '1',
        email: registerDto.email,
        name: registerDto.name,
        password: 'hashedPassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const accessToken = 'jwt.token.here';

      mockUsersService.create.mockResolvedValue(createdUser);
      mockJwtService.sign.mockReturnValue(accessToken);

      // Act
      const result = await service.register(registerDto);

      // Assert
      expect(mockUsersService.create).toHaveBeenCalledWith(registerDto);
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: createdUser.id,
        email: createdUser.email,
      });
      expect(result.accessToken).toBe(accessToken);
      expect(result.user.email).toBe(registerDto.email);
      expect(result.user.id).toBeDefined();
    });
  });

  describe('login', () => {
    it('올바른 자격증명으로 로그인하면 JWT 토큰을 반환한다', async () => {
      // Arrange
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const user = {
        id: '1',
        email: loginDto.email,
        password: 'hashedPassword',
        name: '테스트',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const accessToken = 'jwt.token.here';

      mockUsersService.findByEmail.mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);
      mockJwtService.sign.mockReturnValue(accessToken);

      // Act
      const result = await service.login(loginDto);

      // Assert
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, user.password);
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
      });
      expect(result.accessToken).toBe(accessToken);
      expect(result.user.email).toBe(loginDto.email);
    });

    it('사용자가 존재하지 않으면 UnauthorizedException을 던진다', async () => {
      // Arrange
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };
      mockUsersService.findByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('비밀번호가 틀리면 UnauthorizedException을 던진다', async () => {
      // Arrange
      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };
      const user = {
        id: '1',
        email: loginDto.email,
        password: 'hashedPassword',
        name: '테스트',
      };
      mockUsersService.findByEmail.mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => false);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateUser', () => {
    it('유효한 사용자를 반환한다', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';
      const user = {
        id: '1',
        email,
        password: 'hashedPassword',
        name: '테스트',
      };

      mockUsersService.findByEmail.mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);

      // Act
      const result = await service.validateUser(email, password);

      // Assert
      expect(result).toEqual(user);
    });

    it('비밀번호가 틀리면 null을 반환한다', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'wrongpassword';
      const user = {
        id: '1',
        email,
        password: 'hashedPassword',
        name: '테스트',
      };

      mockUsersService.findByEmail.mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => false);

      // Act
      const result = await service.validateUser(email, password);

      // Assert
      expect(result).toBeNull();
    });
  });
});
