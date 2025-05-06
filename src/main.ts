import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; // Import ValidationPipe
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'; // Import Swagger
import helmet from 'helmet'; // Import helmet
import { ApiResponseDto } from './common/dto/api-response.dto'; // Import ApiResponseDto
import { LawyerProfileDto } from './lawyers/dto/lawyer-profile.dto'; // Import LawyerProfileDto
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

// Function-level comment: Bootstrap the NestJS application.
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Apply Helmet middleware with modified configuration for Swagger UI
  // app.use(
  //   helmet({
  //     contentSecurityPolicy: false, // Disable CSP for development
  //     crossOriginEmbedderPolicy: false, // Allow loading resources from different origins
  //   }),
  // );

  // Enable CORS (adjust origins as needed for production)
  app.enableCors({
    origin: '*', // Or specify allowed origins: ['http://localhost:3000', 'https://your-frontend.com']
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });
  // app.enableCors();

  // Apply global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that do not have any decorators
      forbidNonWhitelisted: true, // Throw errors if non-whitelisted values are provided
      transform: true, // Automatically transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true, // Allow implicit type conversion based on TS type
      },
    }),
  );

  // Global transform interceptor
  app.useGlobalInterceptors(new TransformInterceptor());

  // Setup Swagger/OpenAPI Documentation
  const config = new DocumentBuilder()
    .setTitle('Advonex API')
    .setDescription('API documentation for the Advonex backend application')
    .setVersion('1.0')
    .addBearerAuth() // Add support for Bearer token authentication
    .build();
  // Pass extra models to ensure generic DTOs and their types are registered
  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [ApiResponseDto, LawyerProfileDto], // Added this line
  });
  SwaggerModule.setup('api', app, document); // Serve Swagger UI at /api

  const port = process.env.PORT || 3003;
  // Listen on all network interfaces (0.0.0.0) to make it accessible from other machines
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`Swagger UI available at: ${await app.getUrl()}/api`);
}
bootstrap();
