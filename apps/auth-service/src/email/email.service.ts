import { Resend } from 'resend';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from 'src/common/logger/logger.service';
import Handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';

@Injectable()
export class EmailService {
  private templatesHandlebars: Map<string, HandlebarsTemplateDelegate>;
  private resend: Resend;
  constructor(
    private readonly logger: LoggerService,
    private configService: ConfigService
  ) {
    const resend_apiKey =
      this.configService.getOrThrow<string>('MAIL_PASSWORD');
    this.resend = new Resend(resend_apiKey);
    this.templatesHandlebars = new Map();
    this.loadTemplates();
    this.logger.log('Resend email service initialized');
  }

  /**
   * Loads email templates from the templates directory and compiles them using Handlebars.
   *
   * Templates loaded:
   * - verification.hbs: Email verification template
   * - forget-password.hbs: Password reset template
   *
   * @throws {InternalServerErrorException} If templates cannot be loaded
   * @private
   */
  private loadTemplates(): void {
    const templateDir = path.join(__dirname, 'templates');
    try {
      const verificationTemplatePath = path.join(
        templateDir,
        'verification.hbs'
      );
      if (fs.existsSync(verificationTemplatePath)) {
        const verificationTemplateFile = fs.readFileSync(
          verificationTemplatePath,
          'utf-8'
        );
        this.templatesHandlebars.set(
          'verification',
          Handlebars.compile(verificationTemplateFile)
        );
        this.logger.log('Verification template loaded');
      } else {
        this.logger.warn('Verification template not found');
      }

      const forgetPasswordTemplatePath = path.join(
        templateDir,
        'forget-password.hbs'
      );
      if (fs.existsSync(forgetPasswordTemplatePath)) {
        const forgetPasswordTemplateFile = fs.readFileSync(
          forgetPasswordTemplatePath,
          'utf-8'
        );
        this.templatesHandlebars.set(
          'forgot-password',
          Handlebars.compile(forgetPasswordTemplateFile)
        );
        this.logger.log('Forget-password template loaded');
      } else {
        this.logger.warn('Forget-password template not found');
      }
    } catch (error: unknown) {
      this.logger.error('Failed at Template loading');
      throw new InternalServerErrorException(
        'Email templates could not be loaded',
        error instanceof Error
          ? error.message
          : 'Something went wrong in loading template'
      );
    }
  }

  private renderTemplate(
    templateName: string,
    context: Record<string, any>
  ): string {
    const template = this.templatesHandlebars.get(templateName);
    if (!template) {
      throw new InternalServerErrorException(
        `Template "${templateName}" not found`
      );
    }

    return template(context);
  }

  async sendVerificationEmail(
    to: string,
    userName: string,
    token: string
  ): Promise<void> {
    try {
      console.log('Sending Verification Mail initiated.');
      const appBaseUrl = this.configService.get<string>(
        'APP_BASE_URL',
        'https://www.horizoncomms.me'
      );
      const verificationLink = `${appBaseUrl}/verify-user?token=${token}`;
      console.log('Sending Verification Mail Link Generation.');
      const html = this.renderTemplate('verification', {
        userName,
        verificationLink,
      });
      console.log('Sending Verification Mail Sending');
      const { data, error } = await this.resend.emails.send({
        to: [to],
        from: this.configService.get<string>(
          'MAIL_FROM_EMAIL',
          'HorizonComms <noreply@horizoncomms.me>'
        ),
        subject: '',
        html,
      });

      if (error) {
        this.logger.error('Resend API error:', '', error.message);
        throw new InternalServerErrorException(
          `Email sending failed: ${error.message}`
        );
      }
      this.logger.log(
        `Verification email sent to ${to} successfully. Email ID: ${data?.id}`
      );
    } catch (error: unknown) {
      console.log(error);
      throw new InternalServerErrorException(error);
    }
  }

  /**
   * Send forgot password email using Resend HTTP API
   */
  async sendForgotPasswordEmail(
    to: string,
    userName: string,
    token: string
  ): Promise<void> {
    try {
      this.logger.log(`Sending password reset email to ${to}`);

      const appBaseUrl = this.configService.get<string>(
        'APP_BASE_URL',
        'https://www.horizoncomms.me'
      );
      const resetUrl = `${appBaseUrl}/reset-password?token=${token}`;
      const expirationMinutes = this.configService.get<number>(
        'EMAIL_VERIFICATION_TOKEN_EXPIRATION_MINUTES',
        30
      );

      // Render template with context
      const html = this.renderTemplate('forget-password', {
        brand_name: 'HorizonComms',
        name: userName,
        reset_url: resetUrl,
        expires_in_minutes: expirationMinutes,
        support_email: this.configService.get<string>(
          'SUPPORT_EMAIL',
          'support@horizoncomms.me'
        ),
        year: new Date().getFullYear(),
      });

      // Send via Resend HTTP API
      const { data, error } = await this.resend.emails.send({
        from: this.configService.get<string>(
          'MAIL_FROM_EMAIL',
          'HorizonComms <noreply@horizoncomms.me>'
        ),
        to: [to],
        subject: 'Reset Your Password',
        html,
      });

      if (error) {
        this.logger.error('Resend API error:', '', error.message);
        throw new InternalServerErrorException(
          `Email sending failed: ${error.message}`
        );
      }

      this.logger.log(
        `Password reset email sent successfully. Email ID: ${data?.id}`
      );
    } catch (error) {
      this.logger.error('Failed to send password reset email:', error);

      if (error instanceof InternalServerErrorException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to send password reset email. Please try again.'
      );
    }
  }
}
