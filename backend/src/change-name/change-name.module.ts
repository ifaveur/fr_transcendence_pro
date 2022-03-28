import { Module } from '@nestjs/common';
import { ChangeNameController } from './change-name.controller';
import { ChangeNameService } from './change-name.service';

@Module({
  controllers: [ChangeNameController],
  providers: [ChangeNameService]
})
export class ChangeNameModule {}
