import User from '../db/User.js';
// import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import { hashValue } from '../utils/hash.js';
import { SessionsCollection } from '../db/Session.js';
import { randomBytes } from 'crypto';
import { FIFTEEN_MINUTES, THIRTY_DAYS } from '../constants/indexSort.js';

import jwt from 'jsonwebtoken';
import { sendEmail } from '../utils/sendMail.js';
import { SMTP } from '../constants/index.js';
import { env } from '../utils/env.js';

export const findUser = (filter) => User.findOne(filter);

export const signUpUser = async (payload) => {
  const { password } = payload;
  const hashedPassword = await hashValue(password);

  const user = await User.create({ ...payload, password: hashedPassword });
  return user;
};

export const findSession = (filter) => SessionsCollection.findOne(filter);

export const createSession = async (userId) => {
  await SessionsCollection.deleteOne({ userId });

  const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');
  const accessTokenValidUntil = new Date(Date.now() + FIFTEEN_MINUTES);
  const refreshTokenValidUntil = new Date(Date.now() + THIRTY_DAYS);

  return SessionsCollection.create({
    userId,
    accessToken,
    refreshToken,
    accessTokenValidUntil,
    refreshTokenValidUntil,
  });
};

// export const deleteSession = (filter) => SessionsCollection.deleteOne(filter);

export const deleteSession = async (sessionId) => {
  await SessionsCollection.deleteOne({ _id: sessionId });
};

export const requestResetToken = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw createHttpError(404, 'User noot found');
  }

  const resetToken = jwt.sign(
    {
      sub: user._id,
      email,
    },
    env('JWT_SECRET'),
    {
      expiresIn: '15m',
    },
  );

  await sendEmail({
    from: env(SMTP.SMTP_FROM),
    to: email,
    subject: 'Reset your password',
    html: `  <p> CLick <a target="_blank" href="${env(
      'APP_DOMAIN',
    )}/reset-password?token=${resetToken}">here</a> to reset your password </p>`,
  });
};
