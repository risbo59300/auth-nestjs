import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { UserEntity } from './entites/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { LoginCredentialsDto } from './dto/login-credentials.dto';
import { JwtService } from '@nestjs/jwt';
import { UserSubscribeDto } from './dto/user-suscribe.dto';
import { UserRoleEnum } from 'src/enums/role.enum';

@Injectable()
export class UserService {

  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private jwtService: JwtService
  ) {}
  

	//Methode pour créer un compte utilisateur
  async register(userData: UserSubscribeDto): Promise<Partial<UserEntity>> {
    const user = this.userRepository.create({
      ...userData
    });
    user.salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(user.password, user.salt);
    try {
      await this.userRepository.save(user);
    } catch (e) {
      throw new ConflictException(`Désolé, ce compte existe deja`);
    }
    return {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      };

  }
	//Methode pour se connecter
  async login(credentials: LoginCredentialsDto)  {

    // Récupére le login et le mot de passe
     const {username, password} = credentials;
    // On peut se logger ou via le username ou le password
    // Vérifier est ce qu'il y a un user avec ce login ou ce mdp
    const user = await this.userRepository.createQueryBuilder("user")
      .where("user.username = :username or user.email = :username",
        {username}
        )
      .getOne();

    if (!user)
      throw new NotFoundException('username ou password erronée');
    // Si oui je vérifie est ce que le mot est correct ou pas
    const hashedPassword = await bcrypt.hash(password, user.salt);
    if (hashedPassword === user.password) {
      const payload = {
        username: user.username,
        email: user.email,
        role: user.role
      };
      const jwt = await this.jwtService.sign(payload);
      return {
        "access_token" : jwt
      };
    } else {
      // Si mot de passe incorrect je déclenche une erreur
      throw new NotFoundException('username ou password erronée');
    }
  }

  isOwnerOrAdmin(objet, user) {
    return user.role === UserRoleEnum.ADMIN || (objet.user && objet.user.id === user.id);
  }

	// Methode pour afficher la liste des utilisateurs
  async findAll(options = null): Promise<UserEntity[]> {
    if (options) {
      return await this.userRepository.find(options);
    }
    return await this.userRepository.find();
  }
}

