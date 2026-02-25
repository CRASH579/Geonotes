import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class NearbyQueryDto {
  @ApiProperty({ description: 'Latitude coordinate (-90 to 90)' })
  @Type(() => Number)
  @IsNumber()
  latitude: number;

  @ApiProperty({ description: 'Longitude coordinate (-180 to 180)' })
  @Type(() => Number)
  @IsNumber()
  longitude: number;

  @ApiPropertyOptional({ description: 'Radius in meters. Default 1000m.', default: 1000 })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  radiusMeters?: number;
}
