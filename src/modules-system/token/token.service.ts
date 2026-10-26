import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import {
  ACCESS_TOKEN_EXPIRES_IN,
  ACCESS_TOKEN_SECRET_KEY,
  REFRESH_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_SECRET_KEY,
} from '../../common/constant/app.constant';

type TokenPayload = jwt.JwtPayload & { userId: number };

@Injectable()
export class TokenService {
  private verify(token: string, secret: string, option?: jwt.VerifyOptions) {
    try {
      return jwt.verify(token, secret, option) as TokenPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError)
        throw new ForbiddenException('Token expired');
      throw new UnauthorizedException('Invalid token');
    }
  }

  createAccessToken(userId: number) {
    if (!userId) {
      throw new BadRequestException(
        'There is no userID to generate an access token',
      );
    }

    const accessToken = jwt.sign({ userId }, ACCESS_TOKEN_SECRET_KEY, {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    });

    return accessToken;
  }

  createRefreshToken(userId: number) {
    if (!userId) {
      throw new BadRequestException(
        'There is no userID to generate a refresh token',
      );
    }

    const refreshToken = jwt.sign({ userId }, REFRESH_TOKEN_SECRET_KEY, {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    });

    return refreshToken;
  }

  verifyAccessToken(accessToken: string, option?: jwt.VerifyOptions) {
    const decode = this.verify(accessToken, ACCESS_TOKEN_SECRET_KEY, option);
    return decode;
  }

  verifyRefreshToken(refreshToken: string, option?: jwt.VerifyOptions) {
    const decode = this.verify(refreshToken, REFRESH_TOKEN_SECRET_KEY, option);
    return decode;
  }
}
