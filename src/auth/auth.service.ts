import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) throw new NotFoundException('Usuario o Contraseña incorrectos ');
    if (!bcrypt.compareSync(loginDto.password, user.password))
      throw new NotFoundException('Usuario o Contraseña incorrectos');

    // Generar access token (5 min) y refresh token (24h)
    const accessToken = await this.jwtService.signAsync(
      { id: user.id },
      { expiresIn: '5m' },
    );
    const refreshToken = await this.jwtService.signAsync(
      { id: user.id },
      { expiresIn: '24h' },
    );
    // Guardar refresh token en la base de datos
    await this.usersService.updateRefreshToken(user.id, refreshToken);
    return { accessToken, refreshToken };
  }

  async register(registerDto: RegisterDto) {
    const userExists = await this.usersService.findByEmail(registerDto.email);
    if (userExists) throw new BadRequestException('El usuario ya existe');
    const user = await this.usersService.register(registerDto);
    return {
      name: user.name,
      surname: user.surname,
      email: user.email,
      role: user.role,
    };
  }

  async refresh(userId: string, refreshToken: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.refreshToken)
      throw new UnauthorizedException('No autorizado');
    if (user.refreshToken !== refreshToken)
      throw new UnauthorizedException('Refresh token inválido');
    // Validar refresh token
    try {
      await this.jwtService.verifyAsync(refreshToken);
    } catch {
      throw new UnauthorizedException('Refresh token expirado o inválido');
    }
    // Generar nuevos tokens
    const newAccessToken = await this.jwtService.signAsync(
      { id: user.id },
      { expiresIn: '5m' },
    );
    const newRefreshToken = await this.jwtService.signAsync(
      { id: user.id },
      { expiresIn: '24h' },
    );
    await this.usersService.updateRefreshToken(user.id, newRefreshToken);
    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }
}
