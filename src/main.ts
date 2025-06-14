import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common'; // Importe ValidationPipe

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar validação globalmente usando ValidationPipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Remove propriedades que não estão no DTO
    forbidNonWhitelisted: true, // Lança um erro se houver propriedades não permitidas
    transform: true, // Transforma os payloads para instâncias DTO
    transformOptions: {
      enableImplicitConversion: true, // Converte tipos automaticamente (ex: string para number)
    },
  }));

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('CoffeeDelivery API')
    .setDescription('API para o sistema CoffeeDelivery')
    .setVersion('1.0')
    .addTag('coffees') // Adicione suas tags aqui, se desejar
    .addTag('tags')
    .addTag('carts')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // O endpoint onde o Swagger UI estará disponível (ex: http://localhost:3000/api)

  await app.listen(3000);
}
bootstrap();