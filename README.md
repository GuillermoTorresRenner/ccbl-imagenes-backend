## Ejemplos de uso de endpoints

### Registro

```http
POST /auth/register
Content-Type: application/json

{
  "email": "usuario@correo.com",
  "password": "contraseña123",
  "name": "Nombre",
  "surname": "Apellido",
  "role": "ADMIN"
}
```

### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "usuario@correo.com",
  "password": "contraseña123"
}
```

Tokens se reciben en cookies seguras.

### Refrescar token

```http
POST /auth/refresh
Cookie: refreshToken=<refresh_token>
```

Devuelve nuevos tokens en cookies.

### Obtener usuario autenticado

```http
GET /auth/me
Cookie: token=<access_token>
```

### Logout

```http
GET /auth/logout
```

Elimina las cookies de autenticación.

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

Este proyecto es un boilerplate para backend con NestJS y Prisma, implementando autenticación JWT con refresh tokens, gestión de usuarios y productos, y estructura modular.

## Tecnologías principales

- NestJS
- Prisma ORM
- PostgreSQL
- JWT (access y refresh tokens)
- Docker (opcional)

## Estructura principal

- `src/` - Código fuente principal
  - `auth/` - Módulo de autenticación (login, registro, guards, decoradores)
  - `users/` - Módulo de usuarios
  - `products/` - Módulo de productos
  - `prisma/` - Servicio y módulo de acceso a base de datos
  - `utils/` - Utilidades
- `prisma/schema/` - Schemas Prisma divididos por dominio
- `test/` - Pruebas e2e

## Autenticación

- **Access token:** Expira en 5 minutos
- **Refresh token:** Expira en 24 horas, se actualiza cada vez que se usa
- Ambos tokens se envían en cookies seguras (httpOnly, secure, sameSite strict)
- El refresh token se almacena en la base de datos por usuario (un solo dispositivo por usuario)

## Endpoints principales

### Auth

- `POST /auth/register` - Registro de usuario
- `POST /auth/login` - Login, devuelve access y refresh tokens en cookies
- `POST /auth/refresh` - Refresca los tokens usando el refresh token
- `GET /auth/me` - Devuelve datos del usuario autenticado
- `GET /auth/logout` - Elimina los tokens y cierra sesión

### Users

- `GET /users/:id` - Obtener usuario por id
- `GET /users` - Listar usuarios (si implementado)
- `POST /users` - Crear usuario (si implementado)

### Products

- `GET /products/:id` - Obtener producto por id
- `GET /products` - Listar productos
- `POST /products` - Crear producto
- `PUT /products/:id` - Actualizar producto
- `DELETE /products/:id` - Eliminar producto

## Particularidades y buenas prácticas

- Prisma schema dividido por dominio, con un archivo principal que contiene `datasource` y `generator`
- Uso de decoradores personalizados para roles y usuario activo
- Guards para roles y autenticación
- Validación de DTOs con `class-validator`
- Uso de Docker para base de datos y Adminer
- Configuración de variables de entorno en `.env`
- Documentación Swagger disponible en `/docs`

## Instalación y uso

```bash
npm install
npm run build
npm run start:dev
```

## Migraciones Prisma

```bash
npx prisma migrate dev --name <nombre>
```

## Pruebas

```bash
npm run test
npm run test:e2e
```

## Variables de entorno

Ver archivo `.env.example` para configuración recomendada.

## Seguridad

- Tokens en cookies httpOnly y secure
- Refresh token se actualiza en cada uso
- Acceso a endpoints protegido por guards y decoradores

## Contacto y soporte

- Autor: Guillermo Torres Renner
- Documentación NestJS: https://docs.nestjs.com
- Documentación Prisma: https://www.prisma.io/docs
[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
