import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

@Injectable()
export class EmailService {
    constructor(
        private mailerService: MailerService,
        private configService: ConfigService
    ) {}

    async sendVerificationEmail(to: string, userName: string, token: string): Promise<void>{
        try {
            console.log("Sending Verification Mail initiated.")
            const appBaseUrl = this.configService.get<string>('APP_BASE_URL','http://localhost:3033');
            const verificationLink = `${appBaseUrl}/api/v1/users/verify-email?token=${token}`;
            console.log("Sending Verification Mail Link Generation.")
            
            console.log("Sending Verification Mail Sending")
            const responseEmailSent = await this.mailerService.sendMail({
                to: to,
                subject: "Verify Your Email Address",
                template: 'verification',
                context: {
                    userName: userName,
                    verificationLink: verificationLink
                },
            })
            console.log("Sending Verification Mail Sent");

            console.log(`Verification email sent to ${to}`);
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException(error);
        }
    }
}
