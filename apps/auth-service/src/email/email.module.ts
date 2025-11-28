import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import * as path from 'path';

console.log(path.join(__dirname, 'templates'));

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const configHost = config.getOrThrow<string>('MAIL_HOST');
        const configPort = parseInt(config.getOrThrow<string>('MAIL_PORT'), 10);
        const configSecure = config
          .getOrThrow<string>('MAIL_SECURE')
          .includes('true');
        const configUser = config.getOrThrow<string>('MAIL_USER');
        const configPassword = config.getOrThrow<string>('MAIL_PASSWORD');

        return {
          transport: {
            host: configHost,
            port: configPort,
            secure: configSecure,
            auth: {
              user: configUser,
              pass: configPassword,
            },
          },
          defaults: {
            from: `"No Reply" <${config.get<string>('MAIL_FROM_EMAIL')}>`,
          },
          template: {
            dir: path.join(__dirname, 'templates'),
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
        };
      },
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
