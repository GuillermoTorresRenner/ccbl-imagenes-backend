// import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient();

// async function main(): Promise<void> {
//   await prisma.users.createMany({
//     data: [
//       {
//         rut: '11111111-1',
//         password:
//           '$2b$10$fnVBkMppKicses7KMN/RV.fWe5iEDRDI0scd3fp4oTm5BToLhjXfi',
//         lastPassword:
//           '$2b$10$fnVBkMppKicses7KMN/RV.fWe5iEDRDI0scd3fp4oTm5BToLhjXfi',

//         name: 'Admin',
//         surname: 'Spak',
//         role: 'ADMIN',
//       },
//       {
//         rut: '22222222-2',
//         password:
//           '$2b$10$fnVBkMppKicses7KMN/RV.fWe5iEDRDI0scd3fp4oTm5BToLhjXfi',
//         lastPassword:
//           '$2b$10$fnVBkMppKicses7KMN/RV.fWe5iEDRDI0scd3fp4oTm5BToLhjXfi',

//         name: 'Production',
//         surname: 'Spak',
//         role: 'PRODUCTION',
//       },
//       {
//         rut: '33333333-3',
//         password:
//           '$2b$10$fnVBkMppKicses7KMN/RV.fWe5iEDRDI0scd3fp4oTm5BToLhjXfi',
//         lastPassword:
//           '$2b$10$fnVBkMppKicses7KMN/RV.fWe5iEDRDI0scd3fp4oTm5BToLhjXfi',

//         name: 'Quality',
//         surname: 'Spak',
//         role: 'QUALITY',
//       },
//       {
//         rut: '44444444-4',
//         password:
//           '$2b$10$fnVBkMppKicses7KMN/RV.fWe5iEDRDI0scd3fp4oTm5BToLhjXfi',
//         lastPassword:
//           '$2b$10$fnVBkMppKicses7KMN/RV.fWe5iEDRDI0scd3fp4oTm5BToLhjXfi',

//         name: 'Store',
//         surname: 'Spak',
//         role: 'STORE',
//       },
//     ],
//   });
// }

// main()
//   .then(async () => {
//     await prisma.$disconnect();
//   })
//   .catch(async (e) => {
//     console.error(e);
//     await prisma.$disconnect();
//     process.exit(1);
//   });
