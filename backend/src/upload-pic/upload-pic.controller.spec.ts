import { Test, TestingModule } from '@nestjs/testing';
import { UploadPicController } from './upload-pic.controller';

describe('UploadPicController', () => {
  let controller: UploadPicController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadPicController],
    }).compile();

    controller = module.get<UploadPicController>(UploadPicController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
