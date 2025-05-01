import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS (adjust origins as needed for production)
  app.enableCors({
    origin: '*', // Or specify allowed origins: ['http://localhost:3000', 'https://your-frontend.com']
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  // Global Validation Pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Automatically remove properties without decorators
    forbidNonWhitelisted: true, // Throw error if non-whitelisted properties are provided
    transform: true, // Automatically transform payloads to DTO instances
    transformOptions: {
      enableImplicitConversion: true, // Allow conversion of primitive types
    },
  }));

  // Swagger Setup (OpenAPI Documentation)
  const config = new DocumentBuilder()
    .setTitle('Advonex API')
    .setDescription('API documentation for the Advonex application')
    .setVersion('1.0')
    .addBearerAuth() // Add this line to enable JWT Bearer token input in Swagger UI
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document); // Serve Swagger UI at /api-docs

  // Explicitly set the port
  const port = process.env.PORT || 3003; // Use environment variable or default to 3003
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`Swagger UI available at: ${await app.getUrl()}/api-docs`);
}
bootstrap();
