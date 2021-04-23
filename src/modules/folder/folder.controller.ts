import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { Auth, Role } from 'src/decorators/auth.decorator';
import { RequestWithUser } from '../auth/auth.controller';
import { CreateFolderDto } from './dto/create-folder.dto';
import { FolderService } from './folder.service';

@Auth([Role.ADMIN])
@UseInterceptors(ClassSerializerInterceptor)
@Controller('folders')
export class FolderController {
  constructor(private foldersService: FolderService) {}

  @Post()
  async create(
    @Req() req: RequestWithUser,
    @Body() createFolderDto: CreateFolderDto,
  ) {
    return await this.foldersService.create(createFolderDto, req.user.userId);
  }
}
