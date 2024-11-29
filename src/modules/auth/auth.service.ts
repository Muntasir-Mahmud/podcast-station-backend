import { compare, hash } from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { sign } from 'jsonwebtoken';
import { JWT_SECRET } from '../../config/constants';
import { db } from '../../db';
import { User, users } from '../../models/user.model';
import { LoginInput, RegisterInput } from './auth.schema';

export class AuthService {
	constructor(private D1: D1Database) {}

	async register(input: RegisterInput): Promise<{ user: User; token: string }> {
		const database = db(this.D1);
		const existingUser = await database.query.users.findFirst({
			where: eq(users.email, input.email),
		});

		if (existingUser) {
			throw new Error('User already exists');
		}

		const passwordHash = await hash(input.password, 10);

		const [user] = await database
			.insert(users)
			.values({
				...input,
				passwordHash,
			})
			.returning();

		const token = sign({ userId: user.id }, JWT_SECRET);

		return { user, token };
	}

	async login(input: LoginInput): Promise<{ user: User; token: string }> {
		const database = db(this.D1);
		const user = await database.query.users.findFirst({
			where: eq(users.email, input.email),
		});

		if (!user) {
			throw new Error('Invalid credentials');
		}

		const isValid = await compare(input.password, user.passwordHash);
		if (!isValid) {
			throw new Error('Invalid credentials');
		}

		const token = sign({ userId: user.id }, JWT_SECRET);

		return { user, token };
	}

	private async generateToken(user: User): Promise<string> {
		return sign(
			{
				userId: user.id,
				email: user.email,
			},
			JWT_SECRET,
			{ expiresIn: '7d' }
		);
	}
}
