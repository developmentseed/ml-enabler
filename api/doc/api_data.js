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
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": true,
            "field": "stack",
            "description": "<p>The name of the deployed stack</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "allowedValues": [
              "\"docker\"",
              "\"aws\""
            ],
            "optional": true,
            "field": "environment",
            "defaultValue": "docker",
            "description": "<p>Environment in which MLEnabler is deployed</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "allowedValues": [
              "\"authenticated\""
            ],
            "optional": true,
            "field": "security",
            "defaultValue": "authenticated",
            "description": "<p>Level of authentication required to use the service</p>"
          }
        ]
      }
    },
    "filename": "./index.js",
    "groupTitle": "Server"
  }
] });
