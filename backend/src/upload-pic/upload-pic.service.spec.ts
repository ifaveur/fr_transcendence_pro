import { Test, TestingModule } from '@nestjs/testing';
import { UploadPicService } from './upload-pic.service';

describe('UploadPicService', () => {
  let service: UploadPicService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UploadPicService],
    }).compile();

    service = module.get<UploadPicService>(UploadPicService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
