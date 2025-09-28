import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';


export const setupSwagger = (app: Express): void => {
    const swaggerSpec = swaggerJSDoc({
        definition: {
            openapi: '3.0.3',
            info: {
                title: 'Server API',
                version: '1.0.0',
            },
            servers: [
                { url: 'http://localhost:3001' }
            ],
        },
        apis: [
            './src/**/*.ts',
        ],
    });
    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}