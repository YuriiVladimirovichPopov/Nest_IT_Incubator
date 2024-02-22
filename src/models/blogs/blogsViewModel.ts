import { Injectable } from '@nestjs/common';

@Injectable()
export class BlogViewModel {
  id: string;
  name: string | null;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
}
