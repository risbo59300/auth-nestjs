import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PayloadInterface } from '../interfaces/payloadInterface';
import { Repository } from 'typeorm';
import { UserEntity } from '../entites/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { jwtConstants } from '../constantes';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: PayloadInterface) {
    // j'ai récupéré mon user
    console.log(payload);
    const user = await this.userRepository.findOne({username: payload.username});
    // Si le user exste je le retourne et la automatiquement ce que je retourne dans validate
    // est mis dans le request
    if (user) {
      delete user.salt;
      delete user.password;
      return user;
    } else {
      // Si non je déclenche une erreur
      throw new UnauthorizedException();
    }

  }
}
