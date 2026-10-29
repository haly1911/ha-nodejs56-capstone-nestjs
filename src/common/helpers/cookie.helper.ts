import { Response } from 'express';
import {
  ACCESS_TOKEN_EXPIRES_IN,
  NODE_ENV,
  REFRESH_TOKEN_EXPIRES_IN,
} from '../constant/app.constant';

export const COOKIE_BASE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: NODE_ENV === 'production',
};

export const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken?: string,
) => {
  res.cookie('accessToken', accessToken, {
    ...COOKIE_BASE_OPTIONS,
    maxAge: ACCESS_TOKEN_EXPIRES_IN * 1000,
  });
  if (refreshToken) {
    res.cookie('refreshToken', refreshToken, {
      ...COOKIE_BASE_OPTIONS,
      maxAge: REFRESH_TOKEN_EXPIRES_IN * 1000,
    });
  }
};
