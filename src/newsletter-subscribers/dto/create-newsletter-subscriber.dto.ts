import { IsNotEmpty, IsString } from "class-validator";

export class CreateNewsletterSubscriberDto {
    @IsNotEmpty()
    @IsString()
    email: string;
}
