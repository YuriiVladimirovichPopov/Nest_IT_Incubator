import { EmailConfirmationType } from '../../types';

export class UserViewModel {
  id: string;
  login: string;
  email: string;
  createdAt: string;
  emailConfirmation: EmailConfirmationType;
  recoveryCode: string;
};
