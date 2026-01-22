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
        responses: {
          "200": { description: "OK" },
        },
      },
    },
  },
};
