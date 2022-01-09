import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { LoginCredentialsDto } from './dto/login-credentials.dto';
import { UserEntity } from './entites/user.entity';
import { UserSubscribeDto } from './dto/user-suscribe.dto';

@Controller('user')
export class UserController {
  constructor(
    private userService: UserService
  ) {
  }

  //creation d'un compte
  @Post()
  register(
    @Body() userData: UserSubscribeDto
  ) {
    return this.userService.register(userData);
  }

  //connexion
  @Post('login')
  login(
    @Body() credentials: LoginCredentialsDto
  ) {
    return this.userService.login(credentials);
  }

  //Liste des utilisateurs
  @Get()
  findAll(): Promise<UserEntity[]> {
    console.log("all")
    return this.userService.findAll();
  }
}
