
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsOptional, IsUUID, IsNumber, validate, ValidateNested } from 'class-validator';

// Handle validation for either ID or name must be present for countries, states, and cities
// This allows flexibility in how the frontend can send location data
export class CountryDto {
  @ApiProperty({ description: 'Country ID or Name must be present ', example: '...' })
  @IsUUID()
  @IsOptional()
  id: string;

  @ApiProperty({ description: 'Country name', example: 'India' })
  @IsString()
    @IsOptional()
  name: string;
}

export class StateDto {
  @ApiProperty({ description: 'State ID  or Name must be present', example: '...' })
  @IsUUID()
    @IsOptional()
  id: string;

  @ApiProperty({ description: 'State name', example: 'Maharashtra' })
  @IsString()
    @IsOptional()
  name: string;

  @ApiProperty({ type: () => CountryDto })
  @ValidateNested()
  @IsOptional()
  @Type(() => CountryDto)
  country?: CountryDto;
}

export class CityDto {
  @ApiProperty({ description: 'City ID  or Name must be present', example: '...' })
  // @IsUUID()
    @IsOptional()
  id: string;

  @ApiProperty({ description: 'City name', example: 'Mumbai' })
  @IsString()
    @IsOptional()
  name: string;

  @ApiProperty({ type: () => StateDto })
    @ValidateNested()
  @Type(() => StateDto)
  state: StateDto;
}

export class LocationDetailsDto {
  @ApiProperty({ description: 'Location ID', example: '...' })
  @IsUUID()
    @IsOptional()
  id?: string;

  @ApiProperty({
    description: 'Full address',
    example: '123 Main St, Apt 4B',
    required: false,
  })
  @IsOptional()
  @IsString()
  address?: string | null;

  @ApiProperty({
    description: 'Latitude',
    example: 19.076,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  latitude?: number | null;

  @ApiProperty({
    description: 'Longitude',
    example: 72.8777,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  longitude?: number | null;

  @ApiProperty({ type: () => CityDto })
  @ValidateNested()
  @Type(() => CityDto)
  city: CityDto;
}
