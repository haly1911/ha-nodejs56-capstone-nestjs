import { Response } from 'express';
import {
  ACCESS_TOKEN_EXPIRES_IN,
  NODE_ENV,
  REFRESH_TOKEN_EXPIRES_IN,
} from '../constant/app.constant';

export const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken?: string,
) => {
  const base = {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: NODE_ENV === 'production',
  };
  res.cookie('accessToken', accessToken, {
    ...base,
    maxAge: ACCESS_TOKEN_EXPIRES_IN * 1000,
  });
  if (refreshToken) {
    res.cookie('refreshToken', refreshToken, {
      ...base,
      maxAge: REFRESH_TOKEN_EXPIRES_IN * 1000,
    });
  }
};
