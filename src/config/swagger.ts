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
      {
        url: process.env.BASE_URL!,
        description: 'Production server',
      }
    ],
    components: {
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'User ID',
            },
            email: {
              type: 'string',
              description: 'User email address',
              example: 'user@example.com',
            },
            password: {
              type: 'string',
              description: 'User hashed password',
              example: '$2b$10$...hash...', // Example hashed password
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation date',
              example: '2022-01-01T00:00:00.000Z', // Example creation date
            },
            isEmailVerified: {
              type: 'boolean',
              description: 'Email verification status',
              example: true,
  
            },
            googleId: {
              type: 'string',
              description: 'Google ID',
              example: '1234567890', // Example Google ID
            },
            required: ['email', 'password'], // Specify required fields
          },
        },
      },
    }
  },
  apis: ['./src/routes/*.ts'], // files containing annotations as above
};

export const swaggerSpec = swaggerJsdoc(options);