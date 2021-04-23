import { Test, TestingModule } from '@nestjs/testing';
import { CatsController } from './cats.controller';
import { CatsService } from './cats.service';
import { Cat } from './interfaces/cat.interface';

describe('CatsController', () => {
  let catsController: CatsController;
  let catsService: CatsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CatsController],
      providers: [CatsService],
    }).compile();

    catsController = module.get<CatsController>(CatsController);
    catsService = module.get<CatsService>(CatsService);
  });

  describe('findAll', () => {
    it('should return an array of cats', async () => {
      const result: Cat[] = [{ name: 'Cat A', age: 1, breed: 'unknown' }];
      const catsServiceFindAllSpy = jest
        .spyOn(catsService, 'findAll')
        .mockImplementation(() => result);

      expect(await catsController.findAll()).toBe(result);
      expect(catsServiceFindAllSpy).toBeCalledTimes(1);
    });
  });
});
