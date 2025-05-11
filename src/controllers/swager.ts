import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

export function setupSwagger(app: Express) {
  const options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Book Review API',
        version: '1.0.0',
      },
    },
    apis: ['./routes/*.ts'],
  };

  const specs = swaggerJsDoc(options);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
}
