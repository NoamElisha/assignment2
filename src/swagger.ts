export const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "Assignment 2 API",
    version: "1.0.0",
  },
  paths: {
    "/health": {
      get: {
        summary: "Health check",
        responses: { "200": { description: "OK" } },
      },
    },

    // USERS (CRUD)
    "/users": {
      post: {
        summary: "Create user",
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/UserCreate" } },
          },
        },
        responses: {
          "201": {
            description: "Created",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/UserPublic" } },
            },
          },
          "400": { description: "Bad Request" },
          "409": { description: "User already exists" },
        },
      },
      get: {
        summary: "Get all users",
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/UserPublic" } },
              },
            },
          },
        },
      },
    },

    "/users/{id}": {
      get: {
        summary: "Get user by id",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": {
            description: "OK",
            content: { "application/json": { schema: { $ref: "#/components/schemas/UserPublic" } } },
          },
          "404": { description: "Not Found" },
        },
      },
      put: {
        summary: "Update user",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/UserUpdate" } },
          },
        },
        responses: {
          "200": {
            description: "OK",
            content: { "application/json": { schema: { $ref: "#/components/schemas/UserPublic" } } },
          },
          "404": { description: "Not Found" },
        },
      },
      delete: {
        summary: "Delete user",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "OK" },
          "404": { description: "Not Found" },
        },
      },
    },

    // AUTH
    "/auth/register": {
      post: {
        summary: "Register",
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/RegisterBody" } },
          },
        },
        responses: {
          "201": {
            description: "Created",
            content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } } },
          },
          "400": { description: "Bad Request" },
          "409": { description: "User already exists" },
        },
      },
    },

    "/auth/login": {
      post: {
        summary: "Login",
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/LoginBody" } },
          },
        },
        responses: {
          "200": {
            description: "OK",
            content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } } },
          },
          "400": { description: "Bad Request" },
          "401": { description: "Invalid credentials" },
        },
      },
    },

    "/auth/logout": {
      post: {
        summary: "Logout",
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/RefreshBody" } },
          },
        },
        responses: {
          "200": { description: "OK" },
          "400": { description: "Bad Request" },
        },
      },
    },

    "/auth/refresh": {
      post: {
        summary: "Refresh access token",
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/RefreshBody" } },
          },
        },
        responses: {
          "200": {
            description: "OK",
            content: { "application/json": { schema: { $ref: "#/components/schemas/RefreshResponse" } } },
          },
          "400": { description: "Bad Request" },
          "401": { description: "Invalid refresh token" },
        },
      },
    },
  },

  components: {
    schemas: {
      UserPublic: {
        type: "object",
        properties: {
          id: { type: "string" },
          username: { type: "string" },
          email: { type: "string" },
        },
        required: ["id", "username", "email"],
      },
      UserCreate: {
        type: "object",
        properties: {
          username: { type: "string" },
          email: { type: "string" },
          password: { type: "string" },
        },
        required: ["username", "email", "password"],
      },
      UserUpdate: {
        type: "object",
        properties: {
          username: { type: "string" },
          email: { type: "string" },
        },
      },
      RegisterBody: {
        type: "object",
        properties: {
          username: { type: "string" },
          email: { type: "string" },
          password: { type: "string" },
        },
        required: ["username", "email", "password"],
      },
      LoginBody: {
        type: "object",
        properties: {
          email: { type: "string" },
          password: { type: "string" },
        },
        required: ["email", "password"],
      },
      RefreshBody: {
        type: "object",
        properties: { refreshToken: { type: "string" } },
        required: ["refreshToken"],
      },
      AuthResponse: {
        type: "object",
        properties: {
          user: { $ref: "#/components/schemas/UserPublic" },
          accessToken: { type: "string" },
          refreshToken: { type: "string" },
        },
        required: ["user", "accessToken", "refreshToken"],
      },
      RefreshResponse: {
        type: "object",
        properties: { accessToken: { type: "string" } },
        required: ["accessToken"],
      },
    },
  },
};
