import {
  Body,
  CacheInterceptor,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Redirect,
  Res,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { Auth, AuthEnum } from '../../decorators/auth.decorator';
import { CreateUserDto, UpdateUserDto } from './dto/create-user.dto';
import { UserEntity } from './users.entity';
import { UsersService } from './users.service';
import { Role } from '../../decorators/auth.decorator';
import { Response } from 'express';
import { Disabled } from 'src/decorators/disabled.decorator';

// @Auth([Role.ADMIN])
@Auth(AuthEnum.PUBLIC)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseInterceptors(CacheInterceptor) // Use Auto-caching
  @Get()
  async findAll(): Promise<Omit<UserEntity, 'password'>[]> {
    return await this.usersService.findAll();
  }

  @Get('oauth')
  // @Redirect('http://localhost:3001?privateKey=abcde', 302)
  async testRedirect(@Query() query) {
    console.log('query', query);
    return { url: 'http://localhost:3001?privateKey=abcde' };
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Omit<UserEntity, 'password'>> {
    return await this.usersService.findOneById(id);
  }

  // @Disabled()
  @Auth(AuthEnum.PUBLIC)
  @Post()
  async create(
    @Body() createUserDto: CreateUserDto,
  ): Promise<Omit<UserEntity, 'password'>> {
    return await this.usersService.create(createUserDto);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<Omit<UserEntity, 'password'>> {
    return await this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return await this.usersService.remove(id);
  }
}
