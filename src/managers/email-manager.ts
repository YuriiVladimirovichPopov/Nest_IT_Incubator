import { EmailAdapter } from '../adapters/email-adapter';

export class EmailManager {
  constructor(private readonly emailAdapter: EmailAdapter) {}
  async sendEmail(email: string, code: string) {
    return this.emailAdapter.sendEmail(email, 'code', code);
  }
}
