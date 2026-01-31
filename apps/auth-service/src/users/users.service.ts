import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { EmailService } from 'src/email/email.service';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { TokenService } from 'src/token/token.service';
import { VerificationTokenResponse } from 'src/token/dto/verification-token-response.dto';
import { LoginUser } from './dto/login-user.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ValidUserDto } from './dto/valid-user-payload.dto';
import { RefreshTokenResponse } from './dto/refresh-token-reponse.dto';
import { CreateTokenDto } from 'src/token/dto/create-token.dto';
import { ForgetPasswordBodyDto } from './dto/forget-password.dto';
import { ResetPasswordBodyDto } from './dto/reset-password.dto';
import { Prisma } from '../prisma/generated';

@Injectable()
export class UsersService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly prismaService: PrismaService,
    private readonly tokenService: TokenService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService
  ) {}

  /**
   * This method Is to create a Fresh Valid User;
   * @param create
   * @returns
   */
  async create(createUserDto: CreateUserDto) {
    const { email, firstName, lastName, password, imageUrl } = createUserDto;

    const existenceAndVerificationOfUser =
      await this.prismaService.user.findUnique({
        where: {
          email: email,
        },
        select: {
          id: true,
          isVerified: true,
          VerificationToken: true,
        },
      });
    console.log(existenceAndVerificationOfUser);

    if (existenceAndVerificationOfUser) {
      if (
        existenceAndVerificationOfUser.VerificationToken &&
        existenceAndVerificationOfUser.VerificationToken.expiresAt > new Date()
      ) {
        throw new ConflictException(
          'Check In the email, we have sent you the verification mail. Or Try again after 15 minutes.'
        );
      }
      throw new ConflictException(`User already exists with ${email}.`);
    }

    console.log('Password hashing Initiated.');
    const hashedPassword = await this.generateHashedPassword(password);
    console.log('Password hashing done.');

    console.log('Transaction Initiated.');
    const transactionResult = await this.prismaService.$transaction(
      async (tx) => {
        const userDocument = await tx.user.create({
          data: {
            email: email,
            firstName: firstName,
            lastName: lastName,
            imageUrl: imageUrl ? imageUrl : '',
            password: hashedPassword,
          },
        });
        console.log('User creation Done.');

        if (!userDocument) {
          throw new InternalServerErrorException(
            'User creation Failed for some reason.'
          );
        } else {
          console.log(`User created successfully with email: ${email}`);
        }

        const currentVerificationToken =
          await this.tokenService.createVerificationToken(userDocument.id, tx);
        console.log(`Verification Token:`);
        console.log(currentVerificationToken);

        await this.emailService.sendVerificationEmail(
          email,
          firstName,
          currentVerificationToken.token
        );
        console.log('Successfully Email sent');

        return {
          message:
            'User Creation has been on hold for verification. Verification Link is sent to mail.',
        };
      },
      {
        maxWait: 5000,
        timeout: 15000,
      }
    );

    return transactionResult;
  }

  /**
   * Controller method to verify a user's email using a verification token.
   *
   * This method:
   * 1. Validates the presence of the token.
   * 2. Calls the token service to verify the token and update user status.
   * 3. Logs verification success and returns a formatted response.
   *
   * @param token - The verification token sent to the user's email.
   * @returns A `VerificationTokenResponse` object containing the verification result.
   * @throws BadRequestException - If the token is missing from the request.
   * @throws InternalServerErrorException - For any unexpected error during the process.
   */
  async verifyEmailToken(token: string): Promise<VerificationTokenResponse> {
    // Step 1: Ensure the token is provided
    if (!token) {
      throw new BadRequestException('Verification token is required.');
    }

    // Step 2: Delegate token verification to the tokenService
    const verificationResult =
      await this.tokenService.verifyVerificationToken(token);

    // Step 3: Log success and return the result
    console.log('User verification completed successfully');
    return verificationResult;
  }

  /**
   * Logs in a user by validating their credentials and generating tokens.
   *
   * @param loginUser - The login credentials provided by the user.
   * @returns A promise that resolves to the login response DTO.
   * @throws UnauthorizedException - If the user is not found or credentials are invalid.
   * @throws InternalServerErrorException - For any unexpected error during the process.
   */
  async login(loginUser: LoginUser): Promise<LoginResponseDto> {
    const ExistenceOfUser = await this.prismaService.user.findUnique({
      where: {
        email: loginUser.email,
      },
      include: {
        VerificationToken: true,
        tokens: true,
      },
    });

    if (!ExistenceOfUser) {
      throw new UnauthorizedException(
        `User with the email: ${loginUser.email} doesn't exists`
      );
    }

    //User is unverifed
    if (!ExistenceOfUser?.isVerified) {
      //User is unverified and doesn't have the verification token expired or active
      if (!ExistenceOfUser.VerificationToken) {
        //Clean up the user and ask to register again
        const cleanUp = await this.prismaService.user.delete({
          where: {
            email: loginUser.email,
          },
        });
        if (!cleanUp) {
          throw new InternalServerErrorException(
            'Clean up failed for the user'
          );
        }
        throw new InternalServerErrorException(
          'Something went while registering! Register again.'
        );
      } else {
        //User is Unverified but have the verification token but Token has exipred So clean up and register again
        if (ExistenceOfUser.VerificationToken.expiresAt < new Date()) {
          //Clean up the user and ask to register again
          const cleanUp = await this.prismaService.user.delete({
            where: {
              email: loginUser.email,
            },
          });
          if (!cleanUp) {
            throw new InternalServerErrorException(
              'Clean up failed for the user'
            );
          }
          throw new ConflictException(
            'Your verification Token has expired! Register again.'
          );
        } else {
          //User is Unverified but have the verification token but Token has is active
          throw new ConflictException(
            `A Verification Token was sent to the email: ${loginUser.email}, Check and verify the account before proceeding`
          );
        }
      }
    }

    if (ExistenceOfUser.tokens.length === 3) {
      //TODO: redirect to a page for invalidating the tokens.
      throw new ConflictException(
        'You have already logged in 3 times. Please logout and try again.'
      );
    }

    const verifyThePasswordResponse = await this.verifyPassword(
      loginUser.password,
      ExistenceOfUser.password
    );
    if (!verifyThePasswordResponse) {
      throw new UnauthorizedException('Incorrect Password');
    }

    const TokenResponse =
      await this.tokenService.generateTokens(ExistenceOfUser);
    console.log('Token Response:');
    console.info(TokenResponse);

    if (!TokenResponse) {
      throw new InternalServerErrorException('Token generation failed');
    }
    console.log('User Login Successful');

    const responseData = {
      ...ExistenceOfUser,
      accessToken: TokenResponse.accessToken,
      refreshToken: TokenResponse.refreshToken,
    };

    return new LoginResponseDto(responseData);
  }

  async refreshMyToken(
    validatePayload: RefreshTokenResponse
  ): Promise<CreateTokenDto> {
    //Making call to token service to generate new access and refresh token.
    const result = await this.tokenService.refreshToken(
      validatePayload.refreshToken,
      validatePayload
    );
    if (!result) {
      throw new InternalServerErrorException('Token Refreshing gone wrong');
    }
    return result;
  }

  /**
   * Logs out a user by invalidating their access and refresh tokens.
   * @param validUserPayload - The payload containing user information.
   * @param accessToken - The access token to be invalidated.
   * @returns A success message or void if the operation is successful.
   * Throws an error if the operation fails.
   */
  async logout(
    validUserPayload: ValidUserDto,
    accessToken: string
  ): Promise<string | void> {
    // console.log(validUserPayload);
    const { exp, sessionToken, sub } = validUserPayload;
    if (!exp) {
      throw new BadRequestException(
        'exp field is not found or with in valid field value.'
      );
    }
    const getTimeSpan = this.calculateTimeLeftToExpire(exp);
    const tokenToBlacklist = `BL:${accessToken.trim()}`;
    console.log('Token to blacklist with proper convention.');

    const timeInMilliseconds = getTimeSpan * 1000;
    console.log(
      `Token Time Span in seconds: ${getTimeSpan}, in milli seconds: ${timeInMilliseconds}`
    );

    await this.cacheManager.set(
      tokenToBlacklist,
      'blacklist',
      timeInMilliseconds
    );
    console.log(`Access Token added to blacklist for ${getTimeSpan} seconds`);

    await this.tokenService.invalidateRefreshTokenBySessionToken(
      sessionToken,
      sub
    );
    return 'success';
  }

  async forgotPasswordInit(
    forgotPasswordBody: ForgetPasswordBodyDto
  ): Promise<string> {
    const ExistenceOfUser = await this.prismaService.user.findUniqueOrThrow({
      where: {
        email: forgotPasswordBody.email,
      },
      include: {
        VerificationToken: true,
      },
    });

    if (!ExistenceOfUser.isVerified) {
      if (!ExistenceOfUser.VerificationToken) {
        throw new BadRequestException(
          'Something has went wrong. Contact Admin'
        );
      } else if (ExistenceOfUser.VerificationToken.expiresAt < new Date()) {
        await this.prismaService.user.delete({
          where: {
            email: forgotPasswordBody.email,
          },
        });
        throw new BadRequestException(
          'Your account verification time limit has expired. Please register again, as your account will be purged.'
        );
      } else {
        throw new BadRequestException(
          'An verification token has sent to your email. Please check and verify yourself before movnig further.'
        );
      }
    }

    const resetToken = await this.tokenService.createPasswordResetToken(
      ExistenceOfUser.id
    );
    await this.emailService.sendForgotPasswordEmail(
      ExistenceOfUser.email,
      ExistenceOfUser.firstName,
      resetToken
    );

    return 'Verification Link sent';
  }

  async resetPassword(
    resetPasswordBody: ResetPasswordBodyDto
  ): Promise<{ message: string }> {
    const { password, token } = resetPasswordBody;
    const verificationResponse =
      await this.tokenService.verifyPasswordResetToken(token);

    const newHashPassword = await this.generateHashedPassword(password);

    const transactionResult = await this.prismaService.$transaction(
      async (tx: Prisma.TransactionClient) => {
        await tx.user.update({
          where: {
            id: verificationResponse.id,
            email: verificationResponse.email,
          },
          data: {
            password: newHashPassword,
          },
        });

        await tx.passwordResetToken.deleteMany({
          where: {
            userId: verificationResponse.id,
          },
        });

        return 'Password reset Successful. Login with new password';
      }
    );

    console.log('The password reset complete');
    return {
      message: transactionResult || 'Password Reset Successful',
    };
  }

  /**
   * It will take the string and generate a hash string by salting
   * @param password as string
   * @returns a string of hashed password
   */
  private async generateHashedPassword(password: string): Promise<string> {
    try {
      const SALTNUMBER = parseInt(
        this.configService.getOrThrow('BCRYPT_SALT_NUMBER'),
        10
      );
      const currentSalt = await bcrypt.genSalt(SALTNUMBER);
      const hashedSaltedPassword = await bcrypt.hash(password, currentSalt);
      return hashedSaltedPassword;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Password Hashing failed';
      console.log(error);
      return errorMessage;
    }
  }

  /**
   * This method verifies the provided password against the stored hashed password.
   * @param password - The plain text password to verify.
   * @param hashedPassword - The stored hashed password to compare against.
   * @returns A boolean indicating whether the password is valid.
   */
  private async verifyPassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    try {
      const isMatch = await bcrypt.compare(password, hashedPassword);
      return isMatch;
    } catch (error) {
      console.warn('Some error occured.');
      console.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  /**
   *
   * @param exp as number
   * @returns difference in seconds between the current time and the expiration time
   * This method calculates the time left until a token expires.
   * It takes the expiration timestamp (exp) and returns the difference in seconds
   * between the current time and the expiration time.
   * If the token has already expired, it will return a negative value.
   */
  private calculateTimeLeftToExpire(exp: number) {
    const nowTimeStamp = Math.floor(Date.now() / 1000);
    console.log(`exp: ${exp}, now: ${nowTimeStamp}`);
    const difference = exp - nowTimeStamp;
    return difference;
  }
}
