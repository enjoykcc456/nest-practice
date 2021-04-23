import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UsersRepositoryFake } from './users.entity';
import { UserEntity } from './users.entity';
import { UsersService } from './users.service';
import { Role } from '../../decorators/auth.decorator';
import { CreateUserDto } from './dto/create-user.dto';

describe('UsersService', () => {
  let usersService: UsersService;
  let usersRepository: Repository<UserEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(UserEntity),
          useClass: UsersRepositoryFake,
          // useValue: {},
        },
      ],
    }).compile();

    // Save the references to the objects instantiated by the testing module
    usersService = module.get(UsersService);
    usersRepository = module.get(getRepositoryToken(UserEntity));
  });

  describe('creating a user', () => {
    // describe('with correct parameters', () => {
    it('should return a User entity without password', async () => {
      const createUserData: CreateUserDto = {
        username: 'test',
        password: 'test',
        role: Role.ADMIN,
      };

      const savedUser = new UserEntity();
      savedUser.username = 'test';
      savedUser.role = Role.ADMIN;
      savedUser.createdAt = new Date();
      savedUser.updatedAt = new Date();
      savedUser.id = 1;

      const usersRepositorySaveSpy = jest
        .spyOn(usersRepository, 'save')
        .mockResolvedValue(savedUser);

      const result = await usersService.create(createUserData);

      expect(usersRepositorySaveSpy).toBeCalledTimes(1);
      // expect(usersRepositorySaveSpy).toBeCalledWith(createUserData);
      expect(result).toEqual(savedUser);
    });
    // });
  });
});
