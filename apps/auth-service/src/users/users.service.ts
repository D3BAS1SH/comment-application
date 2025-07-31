import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { EmailService } from 'src/email/email.service';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from "bcrypt";
import { TokenService } from 'src/token/token.service';
import { VerificationTokenResponse } from 'src/token/dto/verification-token-response.dto';
import { LoginUser } from './dto/login-user.dto';
import { LoginResponseDto } from './dto/login-response.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prismaService: PrismaService, 
    private readonly tokenService: TokenService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService
  ){}
  /**
   * This method Is to create a Fresh Valid User;
   * @param create
   * @returns 
   */
  async create(createUserDto: CreateUserDto) {
    try {
      const {email,firstName,lastName,password,imageUrl} = createUserDto;
      
      const existenceAndVerificationOfUser = await this.prismaService.user.findUnique({
        where: {
          email: email
        },select:{
          id:true,
          isVerified: true,
          VerificationToken: true
        }
      })
      console.log(existenceAndVerificationOfUser);
      
      if(existenceAndVerificationOfUser){
        if(existenceAndVerificationOfUser.VerificationToken && existenceAndVerificationOfUser.VerificationToken.expiresAt > new Date()){
          throw new ConflictException("Check In the email, we have sent you the verification mail. Or Try again after 15 minutes.");
        }
        throw new ConflictException(`User already exists with ${email}.`);
      }

      console.log("Transaction Initiated.");
      const transactionResult = await this.prismaService.$transaction(async (tx) => {

        console.log("Password hashing Initiated.");
        const hashedPassword = await this.generateHashedPassword(password);
        console.log("Password hashing done.");
        const userDocument = await tx.user.create({
          data:{
            email: email,
            firstName: firstName,
            lastName: lastName,
            imageUrl: imageUrl? imageUrl : '',
            password: hashedPassword
          }
        })
        console.log("User creation Done.");

        if(!userDocument){
          throw new InternalServerErrorException("User creation Failed for some reason.");
        }else{
          console.log(`User created successfully with email: ${email}`);
        }

        const currentVerificationToken = await this.tokenService.createVerificationToken(userDocument.id,tx);
        console.log(`Verification Token:`);
        console.log(currentVerificationToken);

        await this.emailService.sendVerificationEmail(email,firstName,currentVerificationToken.token);
        console.log("Successfully Email sent");

        return {
          message:"User Creation has been on hold for verification. Verification Link is sent to mail."
        }
      },{
        timeout: 15000,
        maxWait: 5000
      })

      return transactionResult;

    } catch (error) {
      console.warn("Error occured as the following");
      console.error(error);
      throw new InternalServerErrorException(error);
    }
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
    try {
      // Step 1: Ensure the token is provided
      if (!token) {
        throw new BadRequestException('Verification token is required.');
      }

      // Step 2: Delegate token verification to the tokenService
      const verificationResult = await this.tokenService.verifyVerificationToken(token);

      // Step 3: Log success and return the result
      console.log('User verification completed successfully');
      return verificationResult;

    } catch (error) {
      console.warn('Error occurred in verifyEmailToken controller');
      console.error(error);
      return error;
    }
  }

  /**
   * Logs in a user by validating their credentials and generating tokens.
   *
   * @param loginUser - The login credentials provided by the user.
   * @returns A promise that resolves to the login response DTO.
   * @throws UnauthorizedException - If the user is not found or credentials are invalid.
   * @throws InternalServerErrorException - For any unexpected error during the process.
   */
  async login(loginUser: LoginUser):Promise<LoginResponseDto>{
    try {
      const ExistenceOfUser = await this.prismaService.user.findUnique({
        where:{
          email: loginUser.email
        },
        include: {
          VerificationToken: true,
          tokens: true
        }
      })

      if(!ExistenceOfUser){
        throw new UnauthorizedException(`User with the email: ${loginUser.email} doesn't exists`);
      }

      //User is unverifed
      if(!ExistenceOfUser?.isVerified){
        //User is unverified and doesn't have the verification token expired or active
        if(!ExistenceOfUser.VerificationToken){
          //Clean up the user and ask to register again
          const cleanUp = await this.prismaService.user.delete({
            where:{
              email: loginUser.email
            }
          })
          if(!cleanUp){
            throw new InternalServerErrorException("Clean up failed for the user");
          }
          throw new InternalServerErrorException("Something went while registering! Register again.");
        }
        else{
          //User is Unverified but have the verification token but Token has exipred So clean up and register again
          if(ExistenceOfUser.VerificationToken.expiresAt < new Date()){
            //Clean up the user and ask to register again
            const cleanUp = await this.prismaService.user.delete({
              where:{
                email: loginUser.email
              }
            })
            if(!cleanUp){
              throw new InternalServerErrorException("Clean up failed for the user");
            }
            throw new ConflictException("Your verification Token has expired! Register again.");
          }else{
            //User is Unverified but have the verification token but Token has is active
            throw new ConflictException(`A Verification Token was sent to the email: ${loginUser.email}, Check and verify the account before proceeding`);
          }
        }
      }

      if(ExistenceOfUser.tokens.length === 3){
        //TODO: redirect to a page for invalidating the tokens.
        throw new ConflictException("You have already logged in 3 times. Please logout and try again.");
      }

      const verifyThePasswordResponse = await this.verifyPassword(loginUser.password,ExistenceOfUser.password);
      if(!verifyThePasswordResponse){
        throw new UnauthorizedException("Incorrect Password");
      }

      const TokenResponse = await this.tokenService.generateTokens(ExistenceOfUser);
      console.log("Token Response:");
      console.info(TokenResponse);

      if(!TokenResponse){
        throw new InternalServerErrorException("Token generation failed");
      }
      console.log("User Login Successful");

      const responseData = {
        ...ExistenceOfUser,
        accessToken: TokenResponse.accessToken,
        refreshToken: TokenResponse.refreshToken
      }

      return new LoginResponseDto(responseData);
    } catch (error) {
      console.warn("Some error occured.");
      console.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  /**
   * It will take the string and generate a hash string by salting
   * @param password as string
   * @returns a string of hashed password
   */
  private async generateHashedPassword(password: string): Promise<string> {
    try {
      const SALTNUMBER = parseInt(this.configService.getOrThrow('BCRYPT_SALT_NUMBER'),10);
      const currentSalt = await bcrypt.genSalt(SALTNUMBER);
      const hashedSaltedPassword = await bcrypt.hash(password,currentSalt);
      return hashedSaltedPassword;
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  private async verifyPassword(password: string,hashedPassword: string): Promise<boolean> {
    try {
      const isMatch = await bcrypt.compare(password,hashedPassword);
      return isMatch;
    } catch (error) {
      console.warn("Some error occured.");
      console.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
