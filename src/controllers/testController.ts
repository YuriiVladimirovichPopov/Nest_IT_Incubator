import { Controller, Delete, HttpCode } from '@nestjs/common';
import { TestService } from 'src/application/test-servise';

@Controller('all-data')
export class TestController {
  constructor(private readonly testService: TestService) {}

  @Delete('/all-data')
  @HttpCode(204)
  async allData() {
    return await this.testService.deleteAllData();
  }
}
