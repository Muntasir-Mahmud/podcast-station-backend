import { beforeEach, describe, expect, mock, test } from 'bun:test';
import { nanoid } from 'nanoid';
import { AuthService } from './auth.service';

// Mock bcryptjs
mock.module('bcryptjs', () => ({
	hash: () => Promise.resolve('hashed_password'),
	compare: () => Promise.resolve(true),
}));

// Mock jsonwebtoken
mock.module('jsonwebtoken', () => ({
	sign: () => 'mock_token',
}));

// Mock drizzle
mock.module('drizzle-orm/d1', () => {
	const mockUsers = new Map();

	const createUser = (data: any) => ({
		id: nanoid(),
		username: data.username,
		email: data.email,
		passwordHash: data.passwordHash,
		fullName: data.fullName,
		profilePictureUrl: null,
		timestamp: new Date().toISOString(),
	});

	return {
		drizzle: () => ({
			query: {
				users: {
					findFirst: async ({ where }: any) => {
						const email = where.right;
						if (mockUsers.has(email)) {
							return mockUsers.get(email);
						}
						if (email === 'test@example.com') {
							const user = createUser({
								username: 'testuser',
								email: 'test@example.com',
								passwordHash: 'hashed_password',
								fullName: 'Test User',
							});
							mockUsers.set(email, user);
							return user;
						}
						return null;
					},
				},
			},
			insert: (table: any) => {
				const insertValues = (data: any) => {
					if (table.name === 'users') {
						if (mockUsers.has(data.email)) {
							throw new Error('User already exists');
						}
						const user = createUser(data);
						mockUsers.set(data.email, user);
						const returnFn = async () => [user];
						returnFn.returning = returnFn;
						return returnFn;
					}
					const returnFn = async () => [null];
					returnFn.returning = returnFn;
					return returnFn;
				};
				return {
					values: insertValues,
				};
			},
		}),
		eq: (field: any, value: any) => ({ right: value }),
	};
});

describe('AuthService', () => {
	let mockD1: D1Database;
	let authService: AuthService;

	const testUser = {
		username: 'testuser',
		email: 'test@example.com',
		password: 'password123',
		fullName: 'Test User',
	};

	beforeEach(() => {
		mockD1 = {} as D1Database;
		authService = new AuthService(mockD1);
	});

	describe('register', () => {
		test('should register a new user with hashed password', async () => {
			const result = await authService.register({
				...testUser,
				email: 'new@example.com',
			});

			expect(result.user).toBeDefined();
			expect(result.user.email).toBe('new@example.com');
			expect(result.user.username).toBe(testUser.username);
			expect(result.user.passwordHash).toBe('hashed_password');
			expect(result.token).toBe('mock_token');
		});

		test('should not register user with existing email', async () => {
			const promise = authService.register(testUser);
			await expect(promise).rejects.toThrow('User already exists');
		});

		test('should generate JWT token with userId', async () => {
			const result = await authService.register({
				...testUser,
				email: 'another@example.com',
			});

			expect(result.token).toBe('mock_token');
		});
	});

	describe('login', () => {
		test('should login user with correct credentials', async () => {
			const result = await authService.login({
				email: testUser.email,
				password: testUser.password,
			});

			expect(result.user).toBeDefined();
			expect(result.user.email).toBe(testUser.email);
			expect(result.token).toBe('mock_token');
		});

		test('should not login with non-existent email', async () => {
			const promise = authService.login({
				email: 'wrong@email.com',
				password: testUser.password,
			});

			await expect(promise).rejects.toThrow('Invalid credentials');
		});

		test('should not login with wrong password', async () => {
			// Override compare mock for this test
			mock.module('bcryptjs', () => ({
				hash: () => Promise.resolve('hashed_password'),
				compare: () => Promise.resolve(false),
			}));

			const promise = authService.login({
				email: testUser.email,
				password: 'wrongpassword',
			});

			await expect(promise).rejects.toThrow('Invalid credentials');
		});
	});
});
