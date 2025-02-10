import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { SessionService } from '../session/session.service';
import { ForgotService } from '../forgot/forgot.service';
import { MailService } from '../mail/mail.service';
import { AuthProviders, User } from '@prisma/client';
import { RoleEnum } from '../roles/roles.enum';
import { StatusEnum } from '../statuses/statuses.enum';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('AuthService', () => {
    let service: AuthService;
    let usersService: UsersService;
    let sessionService: SessionService;

    const mockUser: Partial<User> = {
        id: 1,
        email: 'test@example.com',
        password: '$2a$10$test-hash',
        provider: AuthProviders.EMAIL,
        roleId: RoleEnum.USER,
        statusId: StatusEnum.ACTIVE,
    };

    const mockJwtService = {
        signAsync: jest.fn().mockResolvedValue('mock-token'),
    };

    const mockConfigService = {
        getOrThrow: jest.fn().mockImplementation((key: string) => {
            const config = {
                'auth.expires': '15m',
                'auth.secret': 'secret',
                'auth.refreshSecret': 'refresh-secret',
                'auth.refreshExpires': '7d',
            };
            return config[key];
        }),
    };

    const mockUsersService = {
        findOneByEmail: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        findOne: jest.fn(),
        softDelete: jest.fn(),
    };

    const mockSessionService = {
        create: jest.fn().mockResolvedValue({ id: 1 }),
        softDelete: jest.fn(),
    };

    const mockForgotService = {
        create: jest.fn(),
        findOneByHash: jest.fn(),
        softDelete: jest.fn(),
    };

    const mockMailService = {
        userSignUp: jest.fn(),
        forgotPassword: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: JwtService, useValue: mockJwtService },
                { provide: ConfigService, useValue: mockConfigService },
                { provide: UsersService, useValue: mockUsersService },
                { provide: SessionService, useValue: mockSessionService },
                { provide: ForgotService, useValue: mockForgotService },
                { provide: MailService, useValue: mockMailService },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        usersService = module.get<UsersService>(UsersService);
        sessionService = module.get<SessionService>(SessionService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('validateLogin', () => {
        const loginDto = {
            email: 'test@example.com',
            password: 'password123',
        };

        it('should successfully validate login and return tokens', async () => {
            jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(mockUser as User);
            const bcrypt = require('bcryptjs');
            jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

            const result = await service.validateLogin(loginDto);

            expect(result).toHaveProperty('token');
            expect(result).toHaveProperty('refreshToken');
            expect(result).toHaveProperty('tokenExpires');
            expect(result).toHaveProperty('user');
        });

        it('should throw error if user not found', async () => {
            jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue({} as User);

            await expect(service.validateLogin(loginDto)).rejects.toThrow(HttpException);
        });

        it('should throw error if password is incorrect', async () => {
            jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(mockUser as User);
            const bcrypt = require('bcryptjs');
            jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

            await expect(service.validateLogin(loginDto)).rejects.toThrow(HttpException);
        });
    });

    describe('register', () => {
        const registerDto = {
            email: 'new@example.com',
            password: 'password123',
            firstName: 'Test',
            lastName: 'User',
        };

        it('should successfully register a new user', async () => {
            jest.spyOn(usersService, 'create').mockResolvedValue(mockUser as User);
            const consoleSpy = jest.spyOn(console, 'log');

            await service.register(registerDto);

            expect(usersService.create).toHaveBeenCalled();
            expect(consoleSpy).toHaveBeenCalledWith(
                'User signup notification would be sent:',
                expect.any(Object),
            );
        });
    });

    describe('forgotPassword', () => {
        const email = 'test@example.com';

        it('should successfully create forgot password request', async () => {
            jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(mockUser as User);
            const consoleSpy = jest.spyOn(console, 'log');

            await service.forgotPassword(email);

            expect(mockForgotService.create).toHaveBeenCalled();
            expect(consoleSpy).toHaveBeenCalledWith(
                'Password reset notification would be sent:',
                expect.any(Object),
            );
        });

        it('should throw error if user not found', async () => {
            jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue({} as User);

            await expect(service.forgotPassword(email)).rejects.toThrow(HttpException);
        });
    });

    describe('me', () => {
        it('should return user profile', async () => {
            jest.spyOn(usersService, 'findOne').mockResolvedValue(mockUser as User);

            const result = await service.me({
                id: 1,
                roleId: RoleEnum.USER,
                sessionId: 1,
                iat: Math.floor(Date.now() / 1000),
                exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour from now
            });

            expect(result).toEqual(mockUser);
        });
    });

    describe('softDelete', () => {
        it('should successfully delete user', async () => {
            await service.softDelete(mockUser as User);

            expect(usersService.softDelete).toHaveBeenCalledWith(mockUser.id);
        });
    });
}); 