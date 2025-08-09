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

    async sendForgotPasswordEmail(to: string, userName: string, token: string): Promise<void> {
        try {
            console.log("Sending Forgot Passwor Email Initiated");
            const appBaseUrl = this.configService.get<string>('APP_BASE_URL','http://localhost:3033');
            const verificationLink = `${appBaseUrl}/api/v1/users/reset-password-verify?token=${token}`;
            const expirationMinutes = this.configService.get<number>('EMAIL_VERIFICATION_TOKEN_EXPIRATION_MINUTES',30);
            console.log("Sending Verification Mail Link Generation.")

            console.log("Sending Verification Mail Sending");
            const responseEmailSent = await this.mailerService.sendMail({
                to: to,
                subject: 'Reset Password Verification',
                template: 'forget-password',
                context: {
                    brand_name: 'Horizoncomms',
                    name: userName,
                    reset_url: verificationLink,
                    expires_in_minutes: expirationMinutes,
                    support_email: 'splinter.cell.1020@gmail.com',
                    year: (new Date()).getFullYear()
                }
            })
            console.log(responseEmailSent);
        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException(error,"Something went wrong while sending email.");
        }
    }
}
