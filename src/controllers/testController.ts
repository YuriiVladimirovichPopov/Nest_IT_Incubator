import { Controller, Delete, HttpCode } from '@nestjs/common';
import { TestService } from '../application/test-servise';

@Controller('testing')
export class TestController {
  constructor(protected testService: TestService) {}

  @Delete('all-data')
  @HttpCode(204)
  async allData() {
    return await this.testService.deleteAllData();
  }
}
