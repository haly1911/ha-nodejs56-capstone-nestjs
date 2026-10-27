import { SetMetadata } from '@nestjs/common';

export const ROLE_KEY = 'ROLE_KEY';
export const Role = (...roles: string[]) => SetMetadata(ROLE_KEY, roles);
