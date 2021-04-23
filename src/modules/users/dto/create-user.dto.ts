import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { Role } from 'src/decorators/auth.decorator';

export class CreateUserDto {
  @IsString()
  @Length(1, 255)
  username: string;

  @IsString()
  @Length(1, 255)
  password: string;

  @IsEnum(Role)
  @IsOptional()
  role: Role;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}
