import { BadRequestException, Injectable, UnauthorizedException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateTokenDto } from './dto/create-token.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService, TokenExpiredError } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import { RefreshTokenDto } from './dto/create-refresh-token.dto';
import { v4 as uuidv4 } from 'uuid';
import { VerificationTokenDto } from './dto/verification-token.dto';
import { VerificationTokenResponse } from './dto/verification-token-response.dto';

@Injectable()
export class TokenService {

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async generateTokens(user: User): Promise<CreateTokenDto> {

    try {
      //Checking the number of Refresh Tokens the user have.(Revoke if, Already logged in more than 3 devices.)
      const tokenNumbers = await this.prisma.token.findMany({
        where:{
          ownerId: user.id
        },
        select:{
          id:true
        }
      })
  
      if(tokenNumbers.length>=3){
        throw new BadRequestException('Exceeding Device limits.');
      }
  
      //Extracting informations as needed for payload
      const payload:tokenPayload = { sub: user.id, email: user.email, isVerified: user.isVerified };
  
      //Generate the Access Token
      const accessToken = this.jwtService.sign(payload,{
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRATION')
      })
  
      //Generate the Refresh Token
      const refreshToken = this.jwtService.sign(payload,{
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION')
      })
  
      //Saving Token for the user
      await this.prisma.token.create({
        data:{
          refreshToken: refreshToken,
          ownerId: user.id,
        }
      })
  
      return {
        accessToken,
        refreshToken
      }
    } catch (error) {
      console.warn("Some error occured while generating token");
      console.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  /**
   * Refreshes the access token using the provided refresh token.
   * This method verifies the refresh token and generates a new access token.
   *
   * @param refreshToken - The refresh token to be used for generating a new access token.
   * @returns A promise that resolves to a CreateTokenDto containing the new access and refresh tokens.
   * @throws UnauthorizedException - If the refresh token is expired or invalid.
   * @throws InternalServerErrorException - If an error occurs during the process or if the token is invalid or broken signature.
   */
  async refreshToken(refreshToken: string): Promise<CreateTokenDto> {
    try {

      const payload = await this.jwtService.verifyAsync<tokenPayload>(refreshToken,{
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET')
      });

      const newAccessToken = await this.jwtService.signAsync(payload,{
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.getOrThrow<string>('JWT_ACCESS_EXPIRATION')
      })

      return {
        accessToken: newAccessToken,
        refreshToken: refreshToken
      };
    } catch (error) {
      console.warn("Some error occured while refreshing token.");
      console.error(error);

      if(error instanceof TokenExpiredError){
        console.log("Invalidation Initiated");
        await this.invalidateRefreshToken({refreshToken});
        console.log("Invalidation completed");

        throw new UnauthorizedException('Refresh token has expired. Please login again.');
      }

      throw new InternalServerErrorException("Refresh Token is invalid or expired.");
    }
  }

  /**
   * Invalidates a specific refresh token by deleting it from the database.
   * This method is used to revoke a user's refresh token, preventing further use.
   *
   * @param refreshTokendto - The DTO containing the refresh token to be invalidated.
   * @returns A promise that resolves when the operation is complete.
   * @throws InternalServerErrorException - If an error occurs during the operation.
   */
  async invalidateRefreshToken(refreshTokendto: RefreshTokenDto): Promise<void> {
    try {
      //Remove the specific token
      await this.prisma.token.delete({
        where:{
          refreshToken: refreshTokendto.refreshToken
        }
      })
      console.log("revocation of refresh token successful.");
    } catch (error) {
      console.warn("Some error occured while revoking the refresh token.");
      console.error(error);
      throw new InternalServerErrorException(error);
    } finally {
      console.log("revocation of refresh token completed.");
    }
  }

  /**
   * Invalidates all tokens associated with a specific user.
   * This method deletes all tokens from the database for the given user ID.
   *
   * @param userId - The unique identifier of the user whose tokens are to be invalidated.
   * @returns A promise that resolves when the operation is complete.
   * @throws InternalServerErrorException - If an error occurs during the operation.
   */
  async invalidateAllTokens(userId: string): Promise<void> {
    //Remove all tokens of the user.
    try {
      await this.prisma.token.deleteMany({
        where:{
          ownerId: userId
        }
      })
  
      console.log("Successful revocation of all tokens successful.");
    } catch (error) {
      console.warn("Some error occured while invalidating Al tokens of a specific user");
      throw new InternalServerErrorException(error);
    }
  }

  /**
   * Creates a new verification token for a given user and saves it to the database.
   * This token is used to verify the user's email address. It removes the already stored Tokens.
   *
   * @param userId The unique identifier of the user for whom the token is being created.
   * @returns A promise that resolves to the newly created verification token.
   */
  async createVerificationToken(userId: string,tx?: any): Promise<VerificationTokenDto> {
    try {
      const token = uuidv4();
      const expirationMinutes = this.configService.get<number>('EMAIL_VERIFICATION_TOKEN_EXPIRATION_MINUTES',30);
      const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000); 
  
      const currentPrismaClient = tx || this.prisma;
      
      //Removing all verificationTokens linked to the user
      await currentPrismaClient.verificationToken.deleteMany({
        where:{
          userId:userId
        }
      })
      console.log("Removed all verification token of a user");
  
      //Token Creating in database.
      await currentPrismaClient.verificationToken.create({
        data:{
          token: token,
          userId: userId,
          expiresAt: expiresAt
        }
      })
  
      return {
        expiresAt: expiresAt,
        token: token,
        userId: userId
      };
    } catch (error) {
      console.warn("Some error ")
      console.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  //Verification methods
  /**
 * Verifies a user using a verification token.
 *
 * This method performs the following steps:
 * 1. Retrieves the verification token record from the database using the provided token.
 * 2. Throws a NotFoundException if the token does not exist.
 * 3. Checks if the token has expired; if so, throws an UnauthorizedException.
 * 4. Marks the associated user as verified by updating the `isVerified` field.
 * 5. Deletes the used verification token to prevent reuse.
 * 6. Returns the updated user information wrapped in a `VerificationTokenResponse` class.
 *
 * @param token - The verification token string sent to the user's email.
 * @returns A `VerificationTokenResponse` object containing the verified user details.
 * @throws NotFoundException - If the token is invalid or not found.
 * @throws UnauthorizedException - If the token has expired.
 * @throws InternalServerErrorException - For any unexpected error during the process.
 */
  async verifyVerificationToken(token: string): Promise<VerificationTokenResponse> {
    try {
      const verificationRecord = await this.prisma.verificationToken.findUnique({
        where:{
          token
        },
        include:{
          user: true
        }
      })
  
      if(!verificationRecord){
        throw new NotFoundException('Verification Token not found or invalid');
      }
  
      if(verificationRecord.expiresAt < new Date()){
        const finalResultOfPurge = await this.prisma.$transaction(async (tx)=> {

          try {
            const deleteTheExpiredToken = await tx.verificationToken.delete({
              where:{
                userId: verificationRecord.userId,
                token: token
              }
            })
            if(!deleteTheExpiredToken){
              throw new InternalServerErrorException("Something went wrong while deleting the token.")
            }
            const userDeletion = await tx.user.delete({
              where:{id:verificationRecord.userId}
            })
            if(!userDeletion){
              throw new InternalServerErrorException("Something went wrong while deleting the user document.")
            }
            return "Completed Deletion of token and user."
          } catch (error) {
            console.warn("Error at transaction of user and token deletion");
            console.error(error);
            throw new InternalServerErrorException(error);
          }

        })
        console.log(finalResultOfPurge);
        throw new UnauthorizedException('Verification Token has expired');
      }
  
      const updateUser = await this.prisma.user.update({
        where: {
          id:verificationRecord.userId
        },
        data: {
          isVerified: true
        },
        omit:{
          password: true,
          updatedAt: true,
          deletedAt: true
        }
      })
  
      await this.prisma.verificationToken.delete({
        where:{
          id: verificationRecord.id
        }
      })
  
      return {
        email: updateUser.email,
        isVerified: updateUser.isVerified,
        message: `The user with the email id ${updateUser.isVerified} is verified`
      }
    } catch (error) {
      console.warn("Error Occured due to unknown reason");
      console.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  private parseJwtExpiration(expiration: string): number {
    const value = parseInt(expiration.slice(0, -1), 10);
    const unit = expiration.slice(-1);

    switch (unit) {
      case 's': return value * 1000;
      case 'm': return value * 60 * 1000;
      case 'h': return value * 60 * 60 * 1000;
      case 'd': return value * 24 * 60 * 60 * 1000;
      default: return 0; // Or throw an error for invalid format
    }
  }
}
