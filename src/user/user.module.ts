import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entites/user.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import * as dotenv from 'dotenv';
import { JwtStrategy } from './strategy/passport-jwt.strategy';
import { jwtConstants } from './constantes';

dotenv.config();
@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    PassportModule.register({
      defaultStrategy: 'jwt'
    }),
    JwtModule.register({
        secret: jwtConstants.secret,
        signOptions: {
          expiresIn: 3600
        }
      })
  ],
  controllers: [
    UserController
  ],
  providers: [UserService, JwtStrategy],
  exports: [UserService]
})
export class UserModule {}
