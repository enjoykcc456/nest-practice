import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UsersService } from '../users/users.service';
import { CreateFileDto, UpdateFileDto } from './dto/create-file.dto';
import { FileEntity } from './file.entity';

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(FileEntity)
    private filesRepository: Repository<FileEntity>,
    private usersService: UsersService,
  ) {}

  async create(
    createFileDto: CreateFileDto,
    file: Express.Multer.File,
    userId: number,
  ): Promise<FileEntity> {
    // name, filepath and metadata
    const originalName = file.originalname.split('.')[0];
    const files = await this.filesRepository.find({ name: originalName });
    const metadata =
      files.length > 0 ? { version: files.length } : { version: 0 };
    const user = await this.usersService.findOneById(userId);

    try {
      const newFile = new FileEntity();
      newFile.name = originalName;
      newFile.creator = user;
      newFile.filepath = file.path;
      newFile.metadata = metadata;
      return await this.filesRepository.save(newFile);
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }

  async update(
    fileId: number,
    updateFileDto: UpdateFileDto,
  ): Promise<FileEntity> {
    try {
      console.log('update dto', updateFileDto);
      const file = await this.filesRepository.findOneOrFail({ id: fileId });
      await this.filesRepository.update(fileId, updateFileDto);
      return await this.filesRepository.findOne(fileId, {
        relations: ['creator', 'parent'],
      });
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }

  async findAll(): Promise<FileEntity[]> {
    return await this.filesRepository.find({
      relations: ['creator', 'parent'],
    });
  }

  async findOneById(id: number): Promise<FileEntity> {
    try {
      return await this.filesRepository.findOneOrFail(
        { id },
        { relations: ['creator', 'parent'] },
      );
    } catch (err) {
      throw new NotFoundException('file not found');
    }
  }
}
