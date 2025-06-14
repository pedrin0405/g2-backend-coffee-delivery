import { Tag as PrismaTag } from '@prisma/client';

export class Tag implements PrismaTag {
  id: string;
  name: string;
  type: any;
  createdAt: Date;
  updatedAt: Date;
} 