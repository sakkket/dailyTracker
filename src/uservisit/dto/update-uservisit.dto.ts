import { PartialType } from '@nestjs/mapped-types';
import { CreateUservisitDto } from './create-uservisit.dto';

export class UpdateUservisitDto extends PartialType(CreateUservisitDto) {}
