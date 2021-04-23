import { HttpStatus, Logger } from '@nestjs/common';
import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Connection, Repository } from 'typeorm';

import { CreateUserDto, UpdateUserDto } from './dto/create-user.dto';
import { UserEntity } from './users.entity';
import {
  InputValidationException,
  NotFoundException,
} from '../../common/custom-exceptions';

const saltOrRounds = 10;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>, // private connection: Connection,
  ) {}

  private readonly logger = new Logger('UserService');

  async create(createUserDto: CreateUserDto): Promise<UserEntity> {
    // const queryRunner = this.connection.createQueryRunner();
    // await queryRunner.connect();
    // await queryRunner.startTransaction();

    try {
      const user = new UserEntity();
      user.username = createUserDto.username;
      user.password = await bcrypt.hash(createUserDto.password, saltOrRounds);
      user.role = createUserDto.role;

      // const createdUser = await queryRunner.manager.save(user);
      // await queryRunner.commitTransaction();
      // return createdUser;

      return await this.usersRepository.save(user);
    } catch (err) {
      // await queryRunner.rollbackTransaction();
      if (err.code === 'ER_DUP_ENTRY')
        throw new InputValidationException('Username must be unique');
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
    // finally {
    //   await queryRunner.release();
    // }
  }

  async update(
    userId: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UserEntity> {
    try {
      const user = await this.usersRepository.findOneOrFail({ id: userId });

      // Check if the update includes password update
      const isMatch = await bcrypt.compare(
        updateUserDto.password,
        user.password,
      );

      updateUserDto.password = isMatch
        ? user.password
        : await bcrypt.hash(updateUserDto.password, saltOrRounds);

      await this.usersRepository.update(userId, updateUserDto);
      return await this.usersRepository.findOne(userId);
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }

  async findOneByUsername(username: string): Promise<UserEntity> {
    try {
      const user = await this.usersRepository.findOneOrFail({ username });
      return user;
    } catch (err) {
      throw new NotFoundException(username);
    }
  }

  async findOneById(userId: number): Promise<UserEntity> {
    try {
      return await this.usersRepository.findOneOrFail({ id: userId });
    } catch (err) {
      throw new NotFoundException(userId);
    }
  }

  async findAll(): Promise<UserEntity[]> {
    return await this.usersRepository.find({ relations: ['files'] });
  }

  async remove(userId: number): Promise<any> {
    const result = await this.usersRepository.delete(userId);
    if (!result.affected) throw new NotFoundException(userId);
    return { userId };
  }

  async setRefreshToken(refreshToken: string, userId: number) {
    try {
      const user = await this.usersRepository.findOneOrFail({ id: userId });
      user.refreshToken = await bcrypt.hash(refreshToken, saltOrRounds);
      await this.usersRepository.update(userId, user);
    } catch (err) {
      throw new NotFoundException(userId);
    }
  }

  async removeRefreshToken(userId: number) {
    try {
      await this.usersRepository.update(userId, {
        refreshToken: null,
      });
    } catch (err) {
      throw new NotFoundException(userId);
    }
  }
}
