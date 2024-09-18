export class CreateNewsletterDto {
    readonly email: string;
    readonly subject: string;
    readonly content: string;
  }
  
  export class UpdateNewsletterDto {
    readonly email?: string;
    readonly subject?: string;
    readonly content?: string;
  }
  
