# Swagger API Documentation

This project includes comprehensive Swagger/OpenAPI documentation for all API endpoints.

## Documentation File

The API documentation is defined in `swagger.yaml` using OpenAPI 3.0.3 specification.

## Viewing the Documentation

### Option 1: Online Swagger Editor (Recommended)

1. Go to [Swagger Editor](https://editor.swagger.io/)
2. Click "File" → "Import file"
3. Select `swagger.yaml` from this project
4. The documentation will be displayed with an interactive UI

### Option 2: Local HTML Viewer

1. Start a simple HTTP server:
```bash
# Using Node.js (if you have it installed)
node swagger-server.js

# Or using Python
python -m http.server 8000

# Or using npx
npx serve
```

2. Open `http://localhost:3000/swagger-ui.html` (or the port your server uses) in your browser

### Option 3: Integrate with Backend Server

If you have an Express backend server, you can integrate Swagger UI:

1. Install dependencies:
```bash
npm install swagger-ui-express yamljs
```

2. Add Swagger configuration to your Express server:
```javascript
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
```

3. Access the documentation at `http://localhost:5000/api-docs`

### Option 4: VS Code Extension

Install the "OpenAPI (Swagger) Editor" extension in VS Code to view and edit the YAML file with syntax highlighting and validation.

## API Endpoints Overview

The API is organized into the following sections:

- **Authentication**: Login, profile management, password changes
- **Products**: CRUD operations for products, barcode lookup
- **Categories**: Product category management
- **Product Variations**: Product attributes and variations
- **Customers**: Customer management and loyalty points
- **Sales**: Sales transaction processing
- **Returns**: Return and refund management
- **Expenses**: Expense tracking
- **Expense Categories**: Expense categorization
- **Reports**: Analytics and reporting endpoints
- **Settings**: System configuration
- **Staff**: Staff member management

## Authentication

Most endpoints require authentication using a Bearer token. To authenticate:

1. Call `POST /api/auth/login` with your credentials
2. Receive a JWT token in the response
3. Include the token in the `Authorization` header for subsequent requests:
   ```
   Authorization: Bearer <your-token>
   ```

## Base URL

The API base URL is configured via the `VITE_API_BASE_URL` environment variable. Update the `servers` section in `swagger.yaml` to match your deployment environment.

## Updating the Documentation

When adding new endpoints or modifying existing ones:

1. Update `swagger.yaml` with the new endpoint definition
2. Follow the existing patterns for request/response schemas
3. Include proper descriptions and examples
4. Update this README if adding new sections

## Validation

The OpenAPI specification can be validated using:

- [Swagger Editor](https://editor.swagger.io/) - Online validation
- [Spectral](https://stoplight.io/open-source/spectral) - CLI linting tool
- VS Code extensions with OpenAPI support

