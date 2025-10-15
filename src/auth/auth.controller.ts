import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  BadRequestException,
  InternalServerErrorException,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Auth } from './decorators/auth.decorator';
import { Roles } from './roles.enum';
import { UsersService } from '../users/users.service';
import { ActiveUser } from './decorators/activeUser.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
  ) {}
  @ApiBearerAuth()
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    try {
      const isUserRegistered = await this.userService.findByEmail(
        registerDto.email,
      );
      if (isUserRegistered) {
        throw new BadRequestException('Usuario ya registrado');
      }
      const newUser = await this.authService.register(registerDto);
      return { message: 'Usuario registrado exitosamente', user: newUser };
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al registrar usuario',
        error.message,
      );
    }
  }
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Req() req, @Res() res) {
    try {
      const { accessToken, refreshToken } =
        await this.authService.login(loginDto);
      const user = await this.userService.findByEmail(loginDto.email);
      await this.userService.updateLastConnection(user.id);
      res.cookie('token', accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 5 * 60 * 1000,
      });
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000,
      });
      return res.status(200).json({
        message: 'Login exitoso',
        user: { name: user.name, surname: user.surname, role: user.role },
      });
    } catch (error) {
      return res.status(500).json({
        message: error.message,
      });
    }
  }
  @Post('refresh')
  async refresh(@Req() req, @Res() res) {
    try {
      const refreshToken = req.cookies['refreshToken'];
      if (!refreshToken) {
        return res.status(401).json({ message: 'No refresh token' });
      }
      // Decodificar el token para obtener el id
      let payload: any;
      try {
        payload =
          await this.authService['jwtService'].verifyAsync(refreshToken);
      } catch {
        return res
          .status(401)
          .json({ message: 'Refresh token inválido o expirado' });
      }
      const { accessToken, refreshToken: newRefreshToken } =
        await this.authService.refresh(payload.id, refreshToken);
      res.cookie('token', accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 5 * 60 * 1000,
      });
      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000,
      });
      return res.status(200).json({ message: 'Token refrescado' });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
  @ApiBearerAuth()
  @Auth()
  @Get('me')
  async me(@ActiveUser() user, @Res() res) {
    try {
      const foundedUser = await this.userService.findById(user.userID);

      if (!foundedUser) {
        return res.clearCookie('token').json({ message: 'logout' });
      }
      return res.json({
        name: foundedUser.name,
        surname: foundedUser.surname,
        role: foundedUser.role,
      });
    } catch (error) {
      throw new NotFoundException({ message: 'Usuario no encontrado', error });
    }
  }

  @Get('logout')
  logout(@Res() res) {
    try {
      res.clearCookie('token');
      res.clearCookie('refreshToken');
      return res.json({ message: 'logout' });
    } catch (error) {
      throw new InternalServerErrorException({
        message: 'Error al cerrar sesión',
        error,
      });
    }
  }
}
