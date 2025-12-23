import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { hashPassword, comparePassword, generateToken } from '../utils/auth';
import { registerSchema, loginSchema } from '../validators/auth.validator';
import { asyncHandler, AppError } from '../middleware/error.middleware';

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  // Validate request body
  const validatedData = registerSchema.parse(req.body);

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: validatedData.email },
  });

  if (existingUser) {
    throw new AppError('User with this email already exists', 409);
  }

  // Hash password
  const hashedPassword = await hashPassword(validatedData.password);

  // Create user
  const user = await prisma.user.create({
    data: {
      email: validatedData.email,
      password: hashedPassword,
      name: validatedData.name,
    },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    },
  });

  // Generate JWT token
  const token = generateToken({
    userId: user.id,
    email: user.email,
  });

  res.status(201).json({
    message: 'User registered successfully',
    user,
    token,
  });
});

/**
 * Login user
 * POST /api/auth/login
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  // Validate request body
  const validatedData = loginSchema.parse(req.body);

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email: validatedData.email },
  });

  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  // Compare passwords
  const isPasswordValid = await comparePassword(validatedData.password, user.password);

  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  // Generate JWT token
  const token = generateToken({
    userId: user.id,
    email: user.email,
  });

  res.json({
    message: 'Login successful',
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    token,
  });
});

/**
 * Get current user profile
 * GET /api/auth/me
 */
export const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json({ user });
});
