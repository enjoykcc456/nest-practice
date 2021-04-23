import { SetMetadata } from '@nestjs/common';

export enum Role {
  ADMIN = 'admin',
  USER = 'user',
}

export enum AuthEnum {
  PUBLIC = 'public',
  ANY_ROLE = 'any_role',
}

export const AUTH_KEY = 'auth';
export const Auth = (required: Role[] | AuthEnum) =>
  SetMetadata(AUTH_KEY, required);
