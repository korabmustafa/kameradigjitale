import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
} from 'class-validator';

const categories = [
  'Film Cameras',
  'Digital Cameras',
  'Lenses',
  'Film',
  'Accessories',
  'Supplies',
] as const;

export class ListProductsDto {
  @IsOptional()
  @IsIn(categories)
  category?: (typeof categories)[number];

  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @Max(200)
  limit = 12;
}