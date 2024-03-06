import { Injectable } from '@nestjs/common';
import { TestRepository } from '../repositories/testing-repository';

@Injectable()
export class TestService {
  constructor(private readonly testingRepository: TestRepository) {}
  async deleteAllData() {
    return await this.testingRepository.deleteAllData();
  }
}
