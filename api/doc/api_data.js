define({ "api": [
  {
    "type": "get",
    "url": "/health",
    "title": "Server Healthcheck",
    "version": "1.0.0",
    "name": "Health",
    "group": "Server",
    "permission": [
      {
        "name": "public",
        "title": "Public",
        "description": "<p>This API endpoint does not require authentication</p>"
      }
    ],
    "description": "<p>AWS ELB Healthcheck for the server</p>",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "healthy",
            "description": "<p>Is the service healthy?</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>The service on how it is doing</p>"
          }
        ]
      }
    },
    "filename": "./index.js",
    "groupTitle": "Server"
  },
  {
    "type": "get",
    "url": "/api",
    "title": "Get Metadata",
    "version": "1.0.0",
    "name": "Meta",
    "group": "Server",
    "permission": [
      {
        "name": "public",
        "title": "Public",
        "description": "<p>This API endpoint does not require authentication</p>"
      }
    ],
    "description": "<p>Return basic metadata about server configuration</p>",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "version",
            "description": "<p>The version of the API</p>"
          }
        ]
      }
    },
    "filename": "./index.js",
    "groupTitle": "Server"
  }
] });
