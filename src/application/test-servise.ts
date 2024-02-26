import { Injectable } from '@nestjs/common';
import { TestRepository } from 'src/repositories/testing-repository';

@Injectable()
export class TestService {
  constructor(private readonly testingRepository: TestRepository) {}
  async deleteAllData() {
    return await this.testingRepository.deleteAllData();
  }
}
