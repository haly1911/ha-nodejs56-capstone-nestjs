import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SignInDto } from './dto/signin.dto';
import { PrismaService } from '../../modules-system/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { TokenService } from '../../modules-system/token/token.service';
import { SignUpDto } from './dto/signup.dto';
import type { Profile } from 'passport-google-oauth20';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private tokenService: TokenService,
  ) {}

  async signUp(body: SignUpDto) {
    const { email, password, name } = body;

    const userExist = await this.prisma.users.findUnique({ where: { email } });
    if (userExist) {
      throw new BadRequestException('Email already exists');
    }

    const hashPassword = bcrypt.hashSync(password, 10);
    await this.prisma.users.create({
      data: {
        email,
        password: hashPassword,
        name,
      },
    });
    return true;
  }

  async signIn(body: SignInDto) {
    const { email, password } = body;
    const userExist = await this.prisma.users.findUnique({
      where: { email },
      omit: { password: false },
    });
    const isValid =
      userExist?.password && bcrypt.compareSync(password, userExist.password);

    if (
      !userExist ||
      !isValid ||
      userExist.is_deleted ||
      userExist.account_status !== 'Active'
    ) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const accessToken = this.tokenService.createAccessToken(userExist.id);
    const refreshToken = this.tokenService.createRefreshToken(userExist.id);

    return { accessToken, refreshToken };
  }

  async googleSignIn(profile: Profile) {
    const email = profile.emails?.[0]?.value;
    if (!email || !profile._json.email_verified) {
      throw new UnauthorizedException('Google email is not verified');
    }
    let userExist = await this.prisma.users.findUnique({
      where: { google_id: profile.id },
    });
    if (!userExist) {
      const byEmail = await this.prisma.users.findUnique({ where: { email } });
      if (byEmail) {
        userExist = await this.prisma.users.update({
          where: { id: byEmail.id },
          data: { google_id: profile.id },
        });
      } else {
        userExist = await this.prisma.users.create({
          data: {
            email,
            name: profile.displayName,
            avatar: profile.photos?.[0]?.value,
            google_id: profile.id,
          },
        });
      }
    }

    if (userExist.is_deleted || userExist.account_status !== 'Active') {
      throw new UnauthorizedException('Account is not available');
    }

    const accessToken = this.tokenService.createAccessToken(userExist.id);
    const refreshToken = this.tokenService.createRefreshToken(userExist.id);

    return { accessToken, refreshToken };
  }

  async getInfo(req) {
    const {
      id,
      email,
      name,
      phone,
      birthday,
      gender,
      role,
      avatar,
      skill,
      certification,
      created_at,
    } = req.user;

    return {
      id,
      email,
      name,
      phone,
      birthday,
      gender,
      role,
      avatar,
      skill,
      certification,
      created_at,
    };
  }

  async refreshToken(req) {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      throw new UnauthorizedException('Please sign in to continue');
    }

    const decode = this.tokenService.verifyRefreshToken(refreshToken);
    const userExist = await this.prisma.users.findUnique({
      where: {
        id: decode.userId,
      },
    });
    if (
      !userExist ||
      userExist.is_deleted ||
      userExist.account_status !== 'Active'
    ) {
      throw new UnauthorizedException('Invalid token');
    }

    const newAccessToken = this.tokenService.createAccessToken(userExist.id);

    return {
      accessToken: newAccessToken,
      refreshToken,
    };
  }
}
