import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { Auth, Role } from 'src/decorators/auth.decorator';
import { RequestWithUser } from '../auth/auth.controller';
import { CreateFileDto, UpdateFileDto } from './dto/create-file.dto';
import { FileEntity } from './file.entity';
import { FileService } from './file.service';

@Auth([Role.ADMIN])
@UseInterceptors(ClassSerializerInterceptor)
@Controller('files')
export class FileController {
  constructor(private fileService: FileService) {}

  @UseInterceptors(FileInterceptor('file'))
  @Post()
  async create(
    @Req() req: RequestWithUser,
    @Body() createFileDto: CreateFileDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await this.fileService.create(createFileDto, file, req.user.userId);
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateFileDto: UpdateFileDto,
  ): Promise<FileEntity> {
    return await this.fileService.update(id, updateFileDto);
  }

  @Get()
  async findAll(): Promise<FileEntity[]> {
    return await this.fileService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<FileEntity> {
    return await this.fileService.findOneById(id);
  }

  @Get('/show/:imgpath')
  seeUploadedFile(@Param('imgpath') image, @Res() res) {
    return res.sendFile(image, { root: './files' });
  }
}
