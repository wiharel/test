import { IsArray, MinLength, IsNotEmpty, IsNumber, IsBoolean, IsOptional, IsString, IsUUID } from "class-validator"

export class UserCreateDto {
    @IsString()
	@IsNotEmpty()
	id: string;

    @IsString()
	@IsNotEmpty()
	username: string;
}