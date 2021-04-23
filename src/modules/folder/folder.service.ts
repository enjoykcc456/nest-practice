import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { FolderEntity } from './folder.entity';

@Injectable()
export class FolderService {
  constructor(
    @InjectRepository(FolderEntity)
    private foldersRepository: Repository<FolderEntity>,
    private usersService: UsersService,
  ) {}

  async create(createFolderDto: CreateFolderDto, userId: number) {
    const user = await this.usersService.findOneById(userId);
    try {
      const newFolder = new FolderEntity();
      newFolder.name = createFolderDto.name;
      newFolder.creator = user;
      return await this.foldersRepository.save(newFolder);
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }
}
