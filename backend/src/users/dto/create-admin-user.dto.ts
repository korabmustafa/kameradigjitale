import { IsEmail, IsIn, IsString } from 'class-validator';

export class CreateAdminUserDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsIn(['ADMIN', 'EDITOR', 'SUPPORT'])
  role!: 'ADMIN' | 'EDITOR' | 'SUPPORT';
}
