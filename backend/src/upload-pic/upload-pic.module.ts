import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { UserModule } from 'src/user/user/user.module';
import { UploadPicController } from './upload-pic.controller';
import { UploadPicService } from './upload-pic.service';

@Module({
  imports: [
    MulterModule.register({
      dest: './upload',
    }), UserModule],
  controllers: [UploadPicController],
  providers: [UploadPicService]
})
export class UploadPicModule {}
