import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Simple App API',
      version: '1.0.0',
      description: 'A RESTful API server for Simple App frontend',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/routes/*.ts'], // files containing annotations as above
};

export const swaggerSpec = swaggerJsdoc(options);