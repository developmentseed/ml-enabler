define({ "api": [
  {
    "type": "post",
    "url": "/api/project/:pid/imagery",
    "title": "Create Imagery",
    "version": "1.0.0",
    "name": "CreateImagery",
    "group": "Imagery",
    "permission": [
      {
        "name": "user",
        "title": "User",
        "description": "<p>A user must be logged in to use this endpoint</p>"
      }
    ],
    "description": "<p>Create a new imagery source</p>",
    "parameter": {
      "fields": {
        "Body": [
          {
            "group": "Body",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Body",
            "type": "String",
            "optional": false,
            "field": "url",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Body",
            "type": "String",
            "optional": false,
            "field": "fmt",
            "description": "<p>undefined</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "id",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "pid",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "created",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "updated",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "url",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "fmt",
            "description": "<p>undefined</p>"
          }
        ]
      }
    },
    "filename": "./routes/project-imagery.js",
    "groupTitle": "Imagery"
  },
  {
    "type": "delete",
    "url": "/api/project/:pid/imagery/:imageryid",
    "title": "delete Imagery",
    "version": "1.0.0",
    "name": "DeleteImagery",
    "group": "Imagery",
    "permission": [
      {
        "name": "user",
        "title": "User",
        "description": "<p>A user must be logged in to use this endpoint</p>"
      }
    ],
    "description": "<p>Delete an imagery source</p>",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "status",
            "description": "<p>The HTTP Status Code of the response</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>A human readable status message</p>"
          }
        ]
      }
    },
    "filename": "./routes/project-imagery.js",
    "groupTitle": "Imagery"
  },
  {
    "type": "get",
    "url": "/api/project/:pid/imagery/:imageryid",
    "title": "Get Imagery",
    "version": "1.0.0",
    "name": "GetImagery",
    "group": "Imagery",
    "permission": [
      {
        "name": "user",
        "title": "User",
        "description": "<p>A user must be logged in to use this endpoint</p>"
      }
    ],
    "description": "<p>Get a single imagery source</p>",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "id",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "pid",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "created",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "updated",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "url",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "fmt",
            "description": "<p>undefined</p>"
          }
        ]
      }
    },
    "filename": "./routes/project-imagery.js",
    "groupTitle": "Imagery"
  },
  {
    "type": "get",
    "url": "/api/project/:pid/imagery",
    "title": "List Imagery",
    "version": "1.0.0",
    "name": "ListImagery",
    "group": "Imagery",
    "permission": [
      {
        "name": "user",
        "title": "User",
        "description": "<p>A user must be logged in to use this endpoint</p>"
      }
    ],
    "description": "<p>Return a list of all imagery sources within a project</p>",
    "parameter": {
      "fields": {
        "Query": [
          {
            "group": "Query",
            "type": "Integer",
            "size": "1 - 100",
            "optional": true,
            "field": "limit",
            "defaultValue": "100",
            "description": "<p>Limit number of returned items</p>"
          },
          {
            "group": "Query",
            "type": "Integer",
            "size": "0 - ∞",
            "optional": true,
            "field": "page",
            "defaultValue": "0",
            "description": "<p>The page, based on the limit, to return</p>"
          },
          {
            "group": "Query",
            "type": "String",
            "optional": true,
            "field": "filter",
            "defaultValue": "",
            "description": "<p>Filter a complete or partial project name</p>"
          },
          {
            "group": "Query",
            "type": "String",
            "allowedValues": [
              "\"desc\"",
              "\"asc\""
            ],
            "optional": true,
            "field": "order",
            "defaultValue": "asc",
            "description": "<p>Sort order to apply to results</p>"
          },
          {
            "group": "Query",
            "type": "String",
            "allowedValues": [
              "\"id\"",
              "\"name\"",
              "\"url\"",
              "\"fmt\"",
              "\"created\"",
              "\"updated\""
            ],
            "optional": true,
            "field": "sort",
            "defaultValue": "created",
            "description": "<p>Field to sort order by</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "total",
            "description": "<p>Total number of items</p>"
          },
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": true,
            "field": "projects",
            "description": "<p>undefined undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "projects.id",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "projects.created",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "projects.updated",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "projects.name",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "projects.url",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "projects.fmt",
            "description": "<p>undefined</p>"
          }
        ]
      }
    },
    "filename": "./routes/project-imagery.js",
    "groupTitle": "Imagery"
  },
  {
    "type": "patch",
    "url": "/api/project/:pid/imagery/:imageryid",
    "title": "Patch Imagery",
    "version": "1.0.0",
    "name": "PatchImagery",
    "group": "Imagery",
    "permission": [
      {
        "name": "user",
        "title": "User",
        "description": "<p>A user must be logged in to use this endpoint</p>"
      }
    ],
    "description": "<p>Update an imagery source</p>",
    "parameter": {
      "fields": {
        "Body": [
          {
            "group": "Body",
            "type": "String",
            "optional": true,
            "field": "name",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Body",
            "type": "String",
            "optional": true,
            "field": "url",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Body",
            "type": "String",
            "optional": true,
            "field": "fmt",
            "description": "<p>undefined</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "id",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "pid",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "created",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "updated",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "url",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "fmt",
            "description": "<p>undefined</p>"
          }
        ]
      }
    },
    "filename": "./routes/project-imagery.js",
    "groupTitle": "Imagery"
  },
  {
    "type": "get",
    "url": "/api/project/:pid/iteration/:iterationid/inference",
    "title": "Create Inference",
    "version": "1.0.0",
    "name": "CreateInference",
    "group": "Inferences",
    "permission": [
      {
        "name": "user",
        "title": "User",
        "description": "<p>A user must be logged in to use this endpoint</p>"
      }
    ],
    "description": "<p>Create a new inference on the server</p>",
    "parameter": {
      "fields": {
        "Body": [
          {
            "group": "Body",
            "type": "Object[]",
            "optional": false,
            "field": "inferences",
            "description": "<p>undefined undefined</p>"
          }
        ]
      }
    },
    "filename": "./routes/project-iteration-inferences.js",
    "groupTitle": "Inferences"
  },
  {
    "type": "post",
    "url": "/api/project/:pid/integration",
    "title": "Create Integration",
    "version": "1.0.0",
    "name": "CreateIntegration",
    "group": "Integrations",
    "permission": [
      {
        "name": "user",
        "title": "User",
        "description": "<p>A user must be logged in to use this endpoint</p>"
      }
    ],
    "description": "<p>Create a new integration within a project</p>",
    "parameter": {
      "fields": {
        "Body": [
          {
            "group": "Body",
            "type": "String",
            "optional": false,
            "field": "integration",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Body",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Body",
            "type": "String",
            "optional": false,
            "field": "url",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Body",
            "type": "String",
            "optional": false,
            "field": "auth",
            "description": "<p>undefined</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "id",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "created",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "updated",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "integration",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "url",
            "description": "<p>undefined</p>"
          }
        ]
      }
    },
    "filename": "./routes/project-integration.js",
    "groupTitle": "Integrations"
  },
  {
    "type": "delete",
    "url": "/api/project/:pid/integration/:integrationid",
    "title": "Delete Integration",
    "version": "1.0.0",
    "name": "DeleteIntegration",
    "group": "Integrations",
    "permission": [
      {
        "name": "user",
        "title": "User",
        "description": "<p>A user must be logged in to use this endpoint</p>"
      }
    ],
    "description": "<p>Delete an integration</p>",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "status",
            "description": "<p>The HTTP Status Code of the response</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>A human readable status message</p>"
          }
        ]
      }
    },
    "filename": "./routes/project-integration.js",
    "groupTitle": "Integrations"
  },
  {
    "type": "get",
    "url": "/api/project/:pid/integration/:integrationid",
    "title": "Get Integration",
    "version": "1.0.0",
    "name": "GetIntegration",
    "group": "Integrations",
    "permission": [
      {
        "name": "user",
        "title": "User",
        "description": "<p>A user must be logged in to use this endpoint</p>"
      }
    ],
    "description": "<p>Get an integration</p>",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "id",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "created",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "updated",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "integration",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "url",
            "description": "<p>undefined</p>"
          }
        ]
      }
    },
    "filename": "./routes/project-integration.js",
    "groupTitle": "Integrations"
  },
  {
    "type": "get",
    "url": "/api/project/:pid/integration",
    "title": "List Integration",
    "version": "1.0.0",
    "name": "ListIntegration",
    "group": "Integrations",
    "permission": [
      {
        "name": "user",
        "title": "User",
        "description": "<p>A user must be logged in to use this endpoint</p>"
      }
    ],
    "description": "<p>Return a list of all api integrations within a project</p>",
    "parameter": {
      "fields": {
        "Query": [
          {
            "group": "Query",
            "type": "Integer",
            "size": "1 - 100",
            "optional": true,
            "field": "limit",
            "defaultValue": "100",
            "description": "<p>Limit number of returned items</p>"
          },
          {
            "group": "Query",
            "type": "Integer",
            "size": "0 - ∞",
            "optional": true,
            "field": "page",
            "defaultValue": "0",
            "description": "<p>The page, based on the limit, to return</p>"
          },
          {
            "group": "Query",
            "type": "String",
            "optional": true,
            "field": "filter",
            "defaultValue": "",
            "description": "<p>Filter a complete or partial name</p>"
          },
          {
            "group": "Query",
            "type": "String",
            "allowedValues": [
              "\"desc\"",
              "\"asc\""
            ],
            "optional": true,
            "field": "order",
            "defaultValue": "asc",
            "description": "<p>Sort order to apply to results</p>"
          },
          {
            "group": "Query",
            "type": "String",
            "allowedValues": [
              "\"id\"",
              "\"created\"",
              "\"updated\"",
              "\"integration\"",
              "\"name\"",
              "\"url\""
            ],
            "optional": true,
            "field": "sort",
            "defaultValue": "created",
            "description": "<p>Field to sort order by</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "total",
            "description": "<p>Total number of items</p>"
          },
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "integrations",
            "description": "<p>undefined undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "integrations.id",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "integrations.created",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "integrations.updated",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "integrations.name",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "integrations.integration",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "integrations.url",
            "description": "<p>undefined</p>"
          }
        ]
      }
    },
    "filename": "./routes/project-integration.js",
    "groupTitle": "Integrations"
  },
  {
    "type": "get",
    "url": "/api/project/:pid/iteration/:iterationid/asset",
    "title": "Download",
    "version": "1.0.0",
    "name": "DownloadIterationAsset",
    "group": "IterationAssets",
    "permission": [
      {
        "name": "user",
        "title": "User",
        "description": "<p>A user must be logged in to use this endpoint</p>"
      }
    ],
    "description": "<p>Download an iteration asset</p>",
    "parameter": {
      "fields": {
        "Query": [
          {
            "group": "Query",
            "type": "String",
            "allowedValues": [
              "\"model\"",
              "\"tfrecord\"",
              "\"checkpoint\""
            ],
            "optional": false,
            "field": "type",
            "description": "<p>Asset Type to upload</p>"
          },
          {
            "group": "Query",
            "type": "String",
            "optional": false,
            "field": "token",
            "description": "<p>Authentication Token</p>"
          }
        ]
      }
    },
    "filename": "./routes/project-iteration-assets.js",
    "groupTitle": "IterationAssets"
  },
  {
    "type": "post",
    "url": "/api/project/:pid/iteration/:iterationid/asset",
    "title": "Upload",
    "version": "1.0.0",
    "name": "UploadIterationAsset",
    "group": "IterationAssets",
    "permission": [
      {
        "name": "user",
        "title": "User",
        "description": "<p>A user must be logged in to use this endpoint</p>"
      }
    ],
    "description": "<p>Create a new upload for an iteration</p>",
    "parameter": {
      "fields": {
        "Query": [
          {
            "group": "Query",
            "type": "String",
            "allowedValues": [
              "\"model\"",
              "\"tfrecord\"",
              "\"checkpoint\""
            ],
            "optional": false,
            "field": "type",
            "description": "<p>Asset Type to upload</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "id",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "created",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "updated",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "docker_link",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "model_link",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "checkpoint_link",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "tfrecord_link",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "save_link",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "tile_zoom",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "inf_list",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "inf_type",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "inf_binary",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "inf_supertile",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "version",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "hint",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "imagery_id",
            "description": "<p>undefined</p>"
          }
        ]
      }
    },
    "filename": "./routes/project-iteration-assets.js",
    "groupTitle": "IterationAssets"
  },
  {
    "type": "post",
    "url": "/api/project/:pid/iteration",
    "title": "Create Iteration",
    "version": "1.0.0",
    "name": "CreateIteration",
    "group": "Iterations",
    "permission": [
      {
        "name": "user",
        "title": "User",
        "description": "<p>A user must be logged in to use this endpoint</p>"
      }
    ],
    "description": "<p>Create a new iteration within a project</p>",
    "parameter": {
      "fields": {
        "Body": [
          {
            "group": "Body",
            "type": "Integer",
            "optional": false,
            "field": "tile_zoom",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Body",
            "type": "String",
            "optional": false,
            "field": "inf_list",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Body",
            "type": "String",
            "optional": false,
            "field": "inf_type",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Body",
            "type": "Boolean",
            "optional": false,
            "field": "inf_binary",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Body",
            "type": "Boolean",
            "optional": false,
            "field": "inf_supertile",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Body",
            "type": "String",
            "size": "5..14",
            "optional": false,
            "field": "version",
            "description": "<p>Semver of iteration</p>"
          },
          {
            "group": "Body",
            "type": "String",
            "allowedValues": [
              "\"iteration\"",
              "\"training\""
            ],
            "optional": false,
            "field": "hint",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Body",
            "type": "Integer",
            "optional": false,
            "field": "imagery_id",
            "description": "<p>undefined</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "id",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "created",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "updated",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "docker_link",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "model_link",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "checkpoint_link",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "tfrecord_link",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "save_link",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "tile_zoom",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "inf_list",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "inf_type",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "inf_binary",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "inf_supertile",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "version",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "hint",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "imagery_id",
            "description": "<p>undefined</p>"
          }
        ]
      }
    },
    "filename": "./routes/project-iteration.js",
    "groupTitle": "Iterations"
  },
  {
    "type": "get",
    "url": "/api/project/:pid/iteration/:iterationid",
    "title": "Get Iteration",
    "version": "1.0.0",
    "name": "GetIteration",
    "group": "Iterations",
    "permission": [
      {
        "name": "user",
        "title": "User",
        "description": "<p>A user must be logged in to use this endpoint</p>"
      }
    ],
    "description": "<p>Get a new iteration</p>",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "id",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "created",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "updated",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "docker_link",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "model_link",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "checkpoint_link",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "tfrecord_link",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "save_link",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "tile_zoom",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "inf_list",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "inf_type",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "inf_binary",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "inf_supertile",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "version",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "hint",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "imagery_id",
            "description": "<p>undefined</p>"
          }
        ]
      }
    },
    "filename": "./routes/project-iteration.js",
    "groupTitle": "Iterations"
  },
  {
    "type": "get",
    "url": "/api/project/:pid/iteration",
    "title": "List Iteration",
    "version": "1.0.0",
    "name": "ListIteration",
    "group": "Iterations",
    "permission": [
      {
        "name": "user",
        "title": "User",
        "description": "<p>A user must be logged in to use this endpoint</p>"
      }
    ],
    "description": "<p>Return a list of all model iterations within a project</p>",
    "parameter": {
      "fields": {
        "Query": [
          {
            "group": "Query",
            "type": "Integer",
            "size": "1 - 100",
            "optional": true,
            "field": "limit",
            "defaultValue": "100",
            "description": "<p>Limit number of returned items</p>"
          },
          {
            "group": "Query",
            "type": "Integer",
            "size": "0 - ∞",
            "optional": true,
            "field": "page",
            "defaultValue": "0",
            "description": "<p>The page, based on the limit, to return</p>"
          },
          {
            "group": "Query",
            "type": "String",
            "optional": true,
            "field": "filter",
            "defaultValue": "",
            "description": "<p>Filter a complete or partial version</p>"
          },
          {
            "group": "Query",
            "type": "String",
            "allowedValues": [
              "\"desc\"",
              "\"asc\""
            ],
            "optional": true,
            "field": "order",
            "defaultValue": "asc",
            "description": "<p>Sort order to apply to results</p>"
          },
          {
            "group": "Query",
            "type": "String",
            "allowedValues": [
              "\"id\"",
              "\"created\"",
              "\"updated\"",
              "\"tile_zoom\"",
              "\"docker_link\"",
              "\"model_link\"",
              "\"checkpoint_link\"",
              "\"tfrecord_link\"",
              "\"save_link\"",
              "\"inf_list\"",
              "\"inf_type\"",
              "\"inf_binary\"",
              "\"inf_supertile\"",
              "\"version\"",
              "\"hint\""
            ],
            "optional": true,
            "field": "sort",
            "defaultValue": "created",
            "description": "<p>Field to sort order by</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "total",
            "description": "<p>Total number of items</p>"
          },
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "iterations",
            "description": "<p>undefined undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "iterations.id",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "iterations.created",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "iterations.updated",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "allowedValues": [
              "\"iteration\"",
              "\"training\""
            ],
            "optional": false,
            "field": "iterations.hint",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "iterations.version",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "iterations.docker_link",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "iterations.model_link",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "iterations.checkpoint_link",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "iterations.tfrecord_link",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "iterations.save_link",
            "description": "<p>undefined</p>"
          }
        ]
      }
    },
    "filename": "./routes/project-iteration.js",
    "groupTitle": "Iterations"
  },
  {
    "type": "patch",
    "url": "/api/project/:pid/iteration/:iterationid",
    "title": "Patch Iteration",
    "version": "1.0.0",
    "name": "PatchIteration",
    "group": "Iterations",
    "permission": [
      {
        "name": "user",
        "title": "User",
        "description": "<p>A user must be logged in to use this endpoint</p>"
      }
    ],
    "description": "<p>Upate an existing iteration</p>",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "id",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "created",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "updated",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "docker_link",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "model_link",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "checkpoint_link",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "tfrecord_link",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "save_link",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "tile_zoom",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "inf_list",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "inf_type",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "inf_binary",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "inf_supertile",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "version",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "hint",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "imagery_id",
            "description": "<p>undefined</p>"
          }
        ]
      }
    },
    "filename": "./routes/project-iteration.js",
    "groupTitle": "Iterations"
  },
  {
    "type": "post",
    "url": "/api/login",
    "title": "Create Session",
    "version": "1.0.0",
    "name": "CreateLogin",
    "group": "Login",
    "permission": [
      {
        "name": "user",
        "title": "User",
        "description": "<p>A user must be logged in to use this endpoint</p>"
      }
    ],
    "description": "<p>Log a user into the service and create an authenticated cookie</p>",
    "parameter": {
      "fields": {
        "Body": [
          {
            "group": "Body",
            "type": "String",
            "optional": false,
            "field": "username",
            "description": "<p>username</p>"
          },
          {
            "group": "Body",
            "type": "String",
            "optional": false,
            "field": "password",
            "description": "<p>password</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "uid",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "username",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "allowedValues": [
              "\"user\"",
              "\"read\"",
              "\"disabled\"",
              "\"admin\""
            ],
            "optional": false,
            "field": "access",
            "description": "<p>The access level of a given user</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": true,
            "field": "validated",
            "description": "<p>Has the user's email address been validated</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": true,
            "field": "token",
            "description": "<p>JSON Web Token to use for subsequent auth</p>"
          }
        ]
      }
    },
    "filename": "./routes/login.js",
    "groupTitle": "Login"
  },
  {
    "type": "post",
    "url": "/api/login/forgot",
    "title": "Forgot Login",
    "version": "1.0.0",
    "name": "ForgotLogin",
    "group": "Login",
    "permission": [
      {
        "name": "public",
        "title": "Public",
        "description": "<p>This API endpoint does not require authentication</p>"
      }
    ],
    "description": "<p>If a user has forgotten their password, send them a password reset link to their email</p>",
    "parameter": {
      "fields": {
        "Body": [
          {
            "group": "Body",
            "type": "String",
            "optional": false,
            "field": "user",
            "description": "<p>username or email to reset password of</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "status",
            "description": "<p>The HTTP Status Code of the response</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>A human readable status message</p>"
          }
        ]
      }
    },
    "filename": "./routes/login.js",
    "groupTitle": "Login"
  },
  {
    "type": "get",
    "url": "/api/login",
    "title": "Session Info",
    "version": "1.0.0",
    "name": "GetLogin",
    "group": "Login",
    "permission": [
      {
        "name": "user",
        "title": "User",
        "description": "<p>A user must be logged in to use this endpoint</p>"
      }
    ],
    "description": "<p>Return information about the currently logged in user</p>",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "uid",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "username",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "allowedValues": [
              "\"user\"",
              "\"read\"",
              "\"disabled\"",
              "\"admin\""
            ],
            "optional": false,
            "field": "access",
            "description": "<p>The access level of a given user</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": true,
            "field": "validated",
            "description": "<p>Has the user's email address been validated</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": true,
            "field": "token",
            "description": "<p>JSON Web Token to use for subsequent auth</p>"
          }
        ]
      }
    },
    "filename": "./routes/login.js",
    "groupTitle": "Login"
  },
  {
    "type": "post",
    "url": "/api/login/reset",
    "title": "Reset Login",
    "version": "1.0.0",
    "name": "ResetLogin",
    "group": "Login",
    "permission": [
      {
        "name": "public",
        "title": "Public",
        "description": "<p>This API endpoint does not require authentication</p>"
      }
    ],
    "description": "<p>Once a user has obtained a password reset by email via the Forgot Login API, use the token to reset the password</p>",
    "parameter": {
      "fields": {
        "Body": [
          {
            "group": "Body",
            "type": "String",
            "optional": false,
            "field": "token",
            "description": "<p>Email provided reset token</p>"
          },
          {
            "group": "Body",
            "type": "String",
            "optional": false,
            "field": "password",
            "description": "<p>The new user password</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "status",
            "description": "<p>The HTTP Status Code of the response</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>A human readable status message</p>"
          }
        ]
      }
    },
    "filename": "./routes/login.js",
    "groupTitle": "Login"
  },
  {
    "type": "get",
    "url": "/api/login/verify",
    "title": "Verify User",
    "version": "1.0.0",
    "name": "VerifyLogin",
    "group": "Login",
    "permission": [
      {
        "name": "public",
        "title": "Public",
        "description": "<p>This API endpoint does not require authentication</p>"
      }
    ],
    "description": "<p>Email Verification of new user</p>",
    "parameter": {
      "fields": {
        "Query": [
          {
            "group": "Query",
            "type": "String",
            "optional": false,
            "field": "token",
            "description": "<p>The validation token which was emailed to you</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "status",
            "description": "<p>The HTTP Status Code of the response</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>A human readable status message</p>"
          }
        ]
      }
    },
    "filename": "./routes/login.js",
    "groupTitle": "Login"
  },
  {
    "type": "get",
    "url": "/api/mapbox",
    "title": "Mapbox Settings",
    "version": "1.0.0",
    "name": "GetMapbox",
    "group": "Mapbox",
    "permission": [
      {
        "name": "user",
        "title": "User",
        "description": "<p>A user must be logged in to use this endpoint</p>"
      }
    ],
    "description": "<p>Return necessary information to show Mapbox maps</p>",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "token",
            "description": "<p>Mapbox access token</p>"
          }
        ]
      }
    },
    "filename": "./routes/mapbox.js",
    "groupTitle": "Mapbox"
  },
  {
    "type": "get",
    "url": "/api/project/:pid/iteration/:iterationid/tiles",
    "title": "TileJSON",
    "version": "1.0.0",
    "name": "TilejsonPredictions",
    "group": "Predictions",
    "permission": [
      {
        "name": "user",
        "title": "User",
        "description": "<p>A user must be logged in to use this endpoint</p>"
      }
    ],
    "description": "<p>Return a TileJSON for the predictions of a given iteration</p>",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "uploaded",
            "description": "<p>undefined</p>"
          }
        ]
      }
    },
    "filename": "./routes/project-iteration-prediction-tiles.js",
    "groupTitle": "Predictions"
  },
  {
    "type": "get",
    "url": "/api/project/:pid/user",
    "title": "List Users",
    "version": "1.0.0",
    "name": "ListProjectAccess",
    "group": "ProjectAccess",
    "permission": [
      {
        "name": "user",
        "title": "User",
        "description": "<p>A user must be logged in to use this endpoint</p>"
      }
    ],
    "description": "<p>Return a list of users with access to a particular project</p>",
    "parameter": {
      "fields": {
        "Query": [
          {
            "group": "Query",
            "type": "Integer",
            "size": "1 - 100",
            "optional": true,
            "field": "limit",
            "defaultValue": "100",
            "description": "<p>Limit number of returned items</p>"
          },
          {
            "group": "Query",
            "type": "Integer",
            "size": "0 - ∞",
            "optional": true,
            "field": "page",
            "defaultValue": "0",
            "description": "<p>The page, based on the limit, to return</p>"
          },
          {
            "group": "Query",
            "type": "String",
            "optional": true,
            "field": "filter",
            "defaultValue": "",
            "description": "<p>Filter a complete or partial name</p>"
          },
          {
            "group": "Query",
            "type": "String",
            "allowedValues": [
              "\"desc\"",
              "\"asc\""
            ],
            "optional": true,
            "field": "order",
            "defaultValue": "asc",
            "description": "<p>Sort order to apply to results</p>"
          },
          {
            "group": "Query",
            "type": "String",
            "allowedValues": [
              "\"id\"",
              "\"uid\"",
              "\"created\"",
              "\"updated\"",
              "\"access\""
            ],
            "optional": true,
            "field": "sort",
            "defaultValue": "created",
            "description": "<p>Field to sort order by</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "total",
            "description": "<p>Total number of items</p>"
          },
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "users",
            "description": "<p>undefined undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": true,
            "field": "users.id",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": true,
            "field": "users.username",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": true,
            "field": "users.created",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": true,
            "field": "users.updated",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": true,
            "field": "users.uid",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": true,
            "field": "users.access",
            "description": "<p>undefined</p>"
          }
        ]
      }
    },
    "filename": "./routes/project-access.js",
    "groupTitle": "ProjectAccess"
  },
  {
    "type": "post",
    "url": "/api/project",
    "title": "Create Project",
    "version": "1.0.0",
    "name": "CreateProject",
    "group": "Projects",
    "permission": [
      {
        "name": "user",
        "title": "User",
        "description": "<p>A user must be logged in to use this endpoint</p>"
      }
    ],
    "description": "<p>Create a new project</p>",
    "parameter": {
      "fields": {
        "Body": [
          {
            "group": "Body",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Body",
            "type": "String",
            "optional": false,
            "field": "source",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Body",
            "type": "String",
            "optional": false,
            "field": "project_url",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Body",
            "type": "Object[]",
            "optional": false,
            "field": "tags",
            "description": "<p>Billing tags that should be attached to project resources undefined</p>"
          },
          {
            "group": "Body",
            "type": "String",
            "optional": false,
            "field": "tags.Key",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Body",
            "type": "String",
            "optional": false,
            "field": "tags.Value",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Body",
            "type": "String",
            "allowedValues": [
              "\"private\"",
              "\"public\""
            ],
            "optional": false,
            "field": "access",
            "description": "<p>Is the project public or private</p>"
          },
          {
            "group": "Body",
            "type": "String",
            "optional": true,
            "field": "notes",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Body",
            "type": "Object[]",
            "optional": false,
            "field": "users",
            "description": "<p>Access list of users for a particular project undefined</p>"
          },
          {
            "group": "Body",
            "type": "Integer",
            "optional": false,
            "field": "users.uid",
            "description": "<p>User ID to set access for</p>"
          },
          {
            "group": "Body",
            "type": "String",
            "allowedValues": [
              "\"user\"",
              "\"read\"",
              "\"disabled\"",
              "\"admin\""
            ],
            "optional": false,
            "field": "users.access",
            "description": "<p>The access level of a given user</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "id",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "created",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "updated",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "source",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "project_url",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "archived",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "tags",
            "description": "<p>Billing tags that should be attached to project resources undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "tags.Key",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "tags.Value",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "allowedValues": [
              "\"private\"",
              "\"public\""
            ],
            "optional": false,
            "field": "access",
            "description": "<p>Is the project public or private</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "notes",
            "description": "<p>undefined</p>"
          }
        ]
      }
    },
    "filename": "./routes/projects.js",
    "groupTitle": "Projects"
  },
  {
    "type": "delete",
    "url": "/api/project/:pid",
    "title": "Delete Project",
    "version": "1.0.0",
    "name": "DeleteProject",
    "group": "Projects",
    "permission": [
      {
        "name": "user",
        "title": "User",
        "description": "<p>A user must be logged in to use this endpoint</p>"
      }
    ],
    "description": "<p>Delete a project</p>",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "status",
            "description": "<p>The HTTP Status Code of the response</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>A human readable status message</p>"
          }
        ]
      }
    },
    "filename": "./routes/projects.js",
    "groupTitle": "Projects"
  },
  {
    "type": "post",
    "url": "/api/project/:pid",
    "title": "Get Project",
    "version": "1.0.0",
    "name": "GetProject",
    "group": "Projects",
    "permission": [
      {
        "name": "user",
        "title": "User",
        "description": "<p>A user must be logged in to use this endpoint</p>"
      }
    ],
    "description": "<p>Return a single project</p>",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "id",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "created",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "updated",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "source",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "project_url",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "archived",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "tags",
            "description": "<p>Billing tags that should be attached to project resources undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "tags.Key",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "tags.Value",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "allowedValues": [
              "\"private\"",
              "\"public\""
            ],
            "optional": false,
            "field": "access",
            "description": "<p>Is the project public or private</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "notes",
            "description": "<p>undefined</p>"
          }
        ]
      }
    },
    "filename": "./routes/projects.js",
    "groupTitle": "Projects"
  },
  {
    "type": "get",
    "url": "/api/project",
    "title": "List Projects",
    "version": "1.0.0",
    "name": "ListProjects",
    "group": "Projects",
    "permission": [
      {
        "name": "user",
        "title": "User",
        "description": "<p>A user must be logged in to use this endpoint</p>"
      }
    ],
    "description": "<p>Return a list of all projects on the server that the user has access to</p>",
    "parameter": {
      "fields": {
        "Query": [
          {
            "group": "Query",
            "type": "Integer",
            "size": "1 - 100",
            "optional": true,
            "field": "limit",
            "defaultValue": "100",
            "description": "<p>Limit number of returned items</p>"
          },
          {
            "group": "Query",
            "type": "Integer",
            "size": "0 - ∞",
            "optional": true,
            "field": "page",
            "defaultValue": "0",
            "description": "<p>The page, based on the limit, to return</p>"
          },
          {
            "group": "Query",
            "type": "String",
            "optional": true,
            "field": "filter",
            "defaultValue": "",
            "description": "<p>Filter a complete or partial project name</p>"
          },
          {
            "group": "Query",
            "type": "String",
            "allowedValues": [
              "\"desc\"",
              "\"asc\""
            ],
            "optional": true,
            "field": "order",
            "defaultValue": "asc",
            "description": "<p>Sort order to apply to results</p>"
          },
          {
            "group": "Query",
            "type": "Boolean",
            "optional": true,
            "field": "archived",
            "defaultValue": "false",
            "description": "<p>Show archived projects</p>"
          },
          {
            "group": "Query",
            "type": "String",
            "allowedValues": [
              "\"id\"",
              "\"created\"",
              "\"updated\"",
              "\"name\"",
              "\"source\"",
              "\"archived\"",
              "\"access\"",
              "\"project_url\""
            ],
            "optional": true,
            "field": "sort",
            "defaultValue": "created",
            "description": "<p>Field to sort order by</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "total",
            "description": "<p>Total number of items</p>"
          },
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "projects",
            "description": "<p>undefined undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "projects.id",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "projects.created",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "projects.updated",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "projects.name",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "projects.source",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "projects.archived",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "projects.project_url",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "allowedValues": [
              "\"private\"",
              "\"public\""
            ],
            "optional": false,
            "field": "projects.access",
            "description": "<p>undefined</p>"
          }
        ]
      }
    },
    "filename": "./routes/projects.js",
    "groupTitle": "Projects"
  },
  {
    "type": "patch",
    "url": "/api/project/:pid",
    "title": "Patch Project",
    "version": "1.0.0",
    "name": "PatchProject",
    "group": "Projects",
    "permission": [
      {
        "name": "user",
        "title": "User",
        "description": "<p>A user must be logged in to use this endpoint</p>"
      }
    ],
    "description": "<p>Update a project</p>",
    "parameter": {
      "fields": {
        "Body": [
          {
            "group": "Body",
            "type": "String",
            "optional": true,
            "field": "name",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Body",
            "type": "String",
            "optional": true,
            "field": "source",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Body",
            "type": "String",
            "optional": true,
            "field": "project_url",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Body",
            "type": "Boolean",
            "optional": true,
            "field": "archived",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Body",
            "type": "Object[]",
            "optional": true,
            "field": "tags",
            "description": "<p>Billing tags that should be attached to project resources undefined</p>"
          },
          {
            "group": "Body",
            "type": "String",
            "optional": false,
            "field": "tags.Key",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Body",
            "type": "String",
            "optional": false,
            "field": "tags.Value",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Body",
            "type": "String",
            "allowedValues": [
              "\"private\"",
              "\"public\""
            ],
            "optional": true,
            "field": "access",
            "description": "<p>Is the project public or private</p>"
          },
          {
            "group": "Body",
            "type": "String",
            "optional": true,
            "field": "notes",
            "description": "<p>undefined</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "id",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "created",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "updated",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "source",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "project_url",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "archived",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "tags",
            "description": "<p>Billing tags that should be attached to project resources undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "tags.Key",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "tags.Value",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "allowedValues": [
              "\"private\"",
              "\"public\""
            ],
            "optional": false,
            "field": "access",
            "description": "<p>Is the project public or private</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "notes",
            "description": "<p>undefined</p>"
          }
        ]
      }
    },
    "filename": "./routes/projects.js",
    "groupTitle": "Projects"
  },
  {
    "type": "get",
    "url": "/api/schema",
    "title": "List Schemas",
    "version": "1.0.0",
    "name": "ListSchemas",
    "group": "Schemas",
    "permission": [
      {
        "name": "public",
        "title": "Public",
        "description": "<p>This API endpoint does not require authentication</p>"
      }
    ],
    "description": "<p>List all JSON Schemas in use With no parameters this API will return a list of all the endpoints that have a form of schema validation If the url/method params are used, the schemas themselves are returned</p> <pre><code>Note: If url or method params are used, they must be used together</code></pre>",
    "parameter": {
      "fields": {
        "Query": [
          {
            "group": "Query",
            "type": "String",
            "allowedValues": [
              "\"GET\"",
              "\"HEAD\"",
              "\"POST\"",
              "\"PUT\"",
              "\"DELETE\"",
              "\"CONNECT\"",
              "\"OPTIONS\"",
              "\"TRACE\"",
              "\"PATCH\""
            ],
            "optional": true,
            "field": "method",
            "description": "<p>HTTP Verb</p>"
          },
          {
            "group": "Query",
            "type": "String",
            "optional": true,
            "field": "url",
            "description": "<p>URLEncoded URL that you want to fetch</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Unknown",
            "optional": true,
            "field": "schemas",
            "description": "<p>undefined</p>"
          }
        ]
      }
    },
    "filename": "./routes/schema.js",
    "groupTitle": "Schemas"
  },
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
  },
  {
    "type": "get",
    "url": "/api/project/:pid/iteration/:iterationid/stack/queue",
    "title": "Get Queue",
    "version": "1.0.0",
    "name": "GetStackQueue",
    "group": "StackQueue",
    "permission": [
      {
        "name": "user",
        "title": "User",
        "description": "<p>A user must be logged in to use this endpoint</p>"
      }
    ],
    "description": "<p>Get all information about the SQS queue powering the stack</p>",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "queued",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "inflight",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "dead",
            "description": "<p>undefined</p>"
          }
        ]
      }
    },
    "filename": "./routes/project-iteration-stack-queue.js",
    "groupTitle": "StackQueue"
  },
  {
    "type": "delete",
    "url": "/api/project/:pid/iteration/:iterationid/stack/queue",
    "title": "Purge Queue",
    "version": "1.0.0",
    "name": "GetStackQueue",
    "group": "StackQueue",
    "permission": [
      {
        "name": "user",
        "title": "User",
        "description": "<p>A user must be logged in to use this endpoint</p>"
      }
    ],
    "description": "<p>Get all information about the SQS queue powering the stack</p>",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "queued",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "inflight",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "dead",
            "description": "<p>undefined</p>"
          }
        ]
      }
    },
    "filename": "./routes/project-iteration-stack-queue.js",
    "groupTitle": "StackQueue"
  },
  {
    "type": "post",
    "url": "/api/project/:pid/iteration/:iterationid/stack",
    "title": "Create Stack",
    "version": "1.0.0",
    "name": "CreateStack",
    "group": "Stacks",
    "permission": [
      {
        "name": "user",
        "title": "User",
        "description": "<p>A user must be logged in to use this endpoint</p>"
      }
    ],
    "description": "<p>Create a new stack within a project</p>",
    "parameter": {
      "fields": {
        "Body": [
          {
            "group": "Body",
            "type": "Object[]",
            "optional": false,
            "field": "tags",
            "description": "<p>Billing tags that should be attached to project resources undefined</p>"
          },
          {
            "group": "Body",
            "type": "String",
            "optional": false,
            "field": "tags.Key",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Body",
            "type": "String",
            "optional": false,
            "field": "tags.Value",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Body",
            "type": "Integer",
            "optional": false,
            "field": "max_size",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Body",
            "type": "Integer",
            "optional": false,
            "field": "max_concurrency",
            "description": "<p>undefined</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>AWS ARN ID</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Human Readable CloudFormation Stack Name</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "status",
            "description": "<p>CloudFormation Status Enum</p>"
          }
        ]
      }
    },
    "filename": "./routes/project-iteration-stack.js",
    "groupTitle": "Stacks"
  },
  {
    "type": "delete",
    "url": "/api/project/:pid/iteration/:iterationid/stack/:stackid",
    "title": "Delete Stack",
    "version": "1.0.0",
    "name": "DeleteStack",
    "group": "Stacks",
    "permission": [
      {
        "name": "user",
        "title": "User",
        "description": "<p>A user must be logged in to use this endpoint</p>"
      }
    ],
    "description": "<p>Delete stack within a project</p>",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "status",
            "description": "<p>The HTTP Status Code of the response</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>A human readable status message</p>"
          }
        ]
      }
    },
    "filename": "./routes/project-iteration-stack.js",
    "groupTitle": "Stacks"
  },
  {
    "type": "get",
    "url": "/api/project/:pid/iteration/:iterationid/stack",
    "title": "Get Stack",
    "version": "1.0.0",
    "name": "GetStack",
    "group": "Stacks",
    "permission": [
      {
        "name": "user",
        "title": "User",
        "description": "<p>A user must be logged in to use this endpoint</p>"
      }
    ],
    "description": "<p>Get all information about a deployed stack</p>",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>AWS ARN ID</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Human Readable CloudFormation Stack Name</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "status",
            "description": "<p>CloudFormation Status Enum</p>"
          }
        ]
      }
    },
    "filename": "./routes/project-iteration-stack.js",
    "groupTitle": "Stacks"
  },
  {
    "type": "get",
    "url": "/api/stack",
    "title": "List Stacks",
    "version": "1.0.0",
    "name": "ListSacks",
    "group": "Stacks",
    "permission": [
      {
        "name": "user",
        "title": "User",
        "description": "<p>A user must be logged in to use this endpoint</p>"
      }
    ],
    "description": "<p>Return a list of all currently deployed stacks</p>",
    "filename": "./routes/stacks.js",
    "groupTitle": "Stacks"
  },
  {
    "type": "get",
    "url": "/api/project/:pid/iteration/:iterationid/task/:taskid",
    "title": "Delete Task",
    "version": "1.0.0",
    "name": "DeleteTask",
    "group": "Tasks",
    "permission": [
      {
        "name": "user",
        "title": "User",
        "description": "<p>A user must be logged in to use this endpoint</p>"
      }
    ],
    "description": "<p>Remove a previous task entry</p>",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "status",
            "description": "<p>The HTTP Status Code of the response</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>A human readable status message</p>"
          }
        ]
      }
    },
    "filename": "./routes/project-iteration-task.js",
    "groupTitle": "Tasks"
  },
  {
    "type": "get",
    "url": "/api/project/:pid/iteration/:iterationid/task/:taskid",
    "title": "Get Task",
    "version": "1.0.0",
    "name": "GetTask",
    "group": "Tasks",
    "permission": [
      {
        "name": "user",
        "title": "User",
        "description": "<p>A user must be logged in to use this endpoint</p>"
      }
    ],
    "description": "<p>Return all information about a single task</p>",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "id",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "iter_id",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "created",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "updated",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "type",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "batch_id",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String/Null",
            "optional": false,
            "field": "log_link",
            "description": "<p>undefined</p>"
          }
        ]
      }
    },
    "filename": "./routes/project-iteration-task.js",
    "groupTitle": "Tasks"
  },
  {
    "type": "get",
    "url": "/api/project/:pid/iteration/:iterationid/task",
    "title": "List Tasks",
    "version": "1.0.0",
    "name": "ListTask",
    "group": "Tasks",
    "permission": [
      {
        "name": "user",
        "title": "User",
        "description": "<p>A user must be logged in to use this endpoint</p>"
      }
    ],
    "description": "<p>Return a list of tasks within a project</p>",
    "parameter": {
      "fields": {
        "Query": [
          {
            "group": "Query",
            "type": "Integer",
            "size": "1 - 100",
            "optional": true,
            "field": "limit",
            "defaultValue": "100",
            "description": "<p>Limit number of returned items</p>"
          },
          {
            "group": "Query",
            "type": "Integer",
            "size": "0 - ∞",
            "optional": true,
            "field": "page",
            "defaultValue": "0",
            "description": "<p>The page, based on the limit, to return</p>"
          },
          {
            "group": "Query",
            "type": "String",
            "allowedValues": [
              "\"desc\"",
              "\"asc\""
            ],
            "optional": true,
            "field": "order",
            "defaultValue": "asc",
            "description": "<p>Sort order to apply to results</p>"
          },
          {
            "group": "Query",
            "type": "String",
            "allowedValues": [
              "\"id\"",
              "\"created\"",
              "\"updated\"",
              "\"type\"",
              "\"batch_id\"",
              "\"log_link\""
            ],
            "optional": true,
            "field": "sort",
            "defaultValue": "created",
            "description": "<p>Field to sort order by</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "total",
            "description": "<p>Total number of items</p>"
          },
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "tasks",
            "description": "<p>undefined undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "tasks.id",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "tasks.iter_id",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "tasks.created",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "tasks.updated",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "tasks.type",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "tasks.batch_id",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "tasks.log_link",
            "description": "<p>undefined</p>"
          }
        ]
      }
    },
    "filename": "./routes/project-iteration-task.js",
    "groupTitle": "Tasks"
  },
  {
    "type": "get",
    "url": "/api/project/:pid/iteration/:iterationid/task/:taskid/logs",
    "title": "Get Logs",
    "version": "1.0.0",
    "name": "LogTask",
    "group": "Tasks",
    "permission": [
      {
        "name": "user",
        "title": "User",
        "description": "<p>A user must be logged in to use this endpoint</p>"
      }
    ],
    "description": "<p>Return task log if it has not expired</p>",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "id",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "iter_id",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "created",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "updated",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "type",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "batch_id",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String/Null",
            "optional": false,
            "field": "log_link",
            "description": "<p>undefined</p>"
          }
        ]
      }
    },
    "filename": "./routes/project-iteration-task.js",
    "groupTitle": "Tasks"
  },
  {
    "type": "patch",
    "url": "/api/project/:pid/iteration/:iterationid/task/:taskid",
    "title": "Patch Task",
    "version": "1.0.0",
    "name": "PatchTask",
    "group": "Tasks",
    "permission": [
      {
        "name": "user",
        "title": "User",
        "description": "<p>A user must be logged in to use this endpoint</p>"
      }
    ],
    "description": "<p>Update a single task</p>",
    "parameter": {
      "fields": {
        "Body": [
          {
            "group": "Body",
            "type": "String",
            "optional": true,
            "field": "log_link",
            "description": "<p>undefined</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "id",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "iter_id",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "created",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "updated",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "type",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "batch_id",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String/Null",
            "optional": false,
            "field": "log_link",
            "description": "<p>undefined</p>"
          }
        ]
      }
    },
    "filename": "./routes/project-iteration-task.js",
    "groupTitle": "Tasks"
  },
  {
    "type": "post",
    "url": "/api/token",
    "title": "Create Token",
    "version": "1.0.0",
    "name": "CreateToken",
    "group": "Token",
    "permission": [
      {
        "name": "user",
        "title": "User",
        "description": "<p>A user must be logged in to use this endpoint</p>"
      }
    ],
    "description": "<p>Create a new API token for programatic access</p>",
    "parameter": {
      "fields": {
        "Body": [
          {
            "group": "Body",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Human Readable name of the API Token</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "id",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Human Readable name of the API Token</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "token",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "created",
            "description": "<p>undefined</p>"
          }
        ]
      }
    },
    "filename": "./routes/tokens.js",
    "groupTitle": "Token"
  },
  {
    "type": "delete",
    "url": "/api/token/:token_id",
    "title": "Delete Token",
    "version": "1.0.0",
    "name": "DeleteToken",
    "group": "Token",
    "permission": [
      {
        "name": "user",
        "title": "User",
        "description": "<p>A user must be logged in to use this endpoint</p>"
      }
    ],
    "description": "<p>Delete a user's API Token</p>",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "status",
            "description": "<p>The HTTP Status Code of the response</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>A human readable status message</p>"
          }
        ]
      }
    },
    "filename": "./routes/tokens.js",
    "groupTitle": "Token"
  },
  {
    "type": "delete",
    "url": "/api/token/:token_id",
    "title": "Get Token",
    "version": "1.0.0",
    "name": "GetToken",
    "group": "Token",
    "permission": [
      {
        "name": "user",
        "title": "User",
        "description": "<p>A user must be logged in to use this endpoint</p>"
      }
    ],
    "description": "<p>Get information about a single token</p>",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "id",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Human Readable name of the API Token</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "created",
            "description": "<p>undefined</p>"
          }
        ]
      }
    },
    "filename": "./routes/tokens.js",
    "groupTitle": "Token"
  },
  {
    "type": "get",
    "url": "/api/token",
    "title": "List Tokens",
    "version": "1.0.0",
    "name": "ListTokens",
    "group": "Token",
    "permission": [
      {
        "name": "user",
        "title": "User",
        "description": "<p>A user must be logged in to use this endpoint</p>"
      }
    ],
    "description": "<p>List all tokens associated with the requester's account</p>",
    "parameter": {
      "fields": {
        "Query": [
          {
            "group": "Query",
            "type": "Integer",
            "size": "1 - 100",
            "optional": true,
            "field": "limit",
            "defaultValue": "100",
            "description": "<p>Limit number of returned items</p>"
          },
          {
            "group": "Query",
            "type": "Integer",
            "size": "0 - ∞",
            "optional": true,
            "field": "page",
            "defaultValue": "0",
            "description": "<p>The page, based on the limit, to return</p>"
          },
          {
            "group": "Query",
            "type": "String",
            "optional": true,
            "field": "filter",
            "defaultValue": "",
            "description": "<p>Filter a complete or partial token name</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "total",
            "description": "<p>Total number of users with the service</p>"
          },
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "tokens",
            "description": "<p>undefined undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "tokens.id",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "tokens.created",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "tokens.name",
            "description": "<p>undefined</p>"
          }
        ]
      }
    },
    "filename": "./routes/tokens.js",
    "groupTitle": "Token"
  },
  {
    "type": "post",
    "url": "/api/user",
    "title": "Create User",
    "version": "1.0.0",
    "name": "CreateUser",
    "group": "User",
    "permission": [
      {
        "name": "public",
        "title": "Public",
        "description": "<p>This API endpoint does not require authentication</p>"
      }
    ],
    "description": "<p>Create a new user</p>",
    "parameter": {
      "fields": {
        "Body": [
          {
            "group": "Body",
            "type": "String",
            "optional": false,
            "field": "username",
            "description": "<p>username</p>"
          },
          {
            "group": "Body",
            "type": "String",
            "optional": false,
            "field": "password",
            "description": "<p>password</p>"
          },
          {
            "group": "Body",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>email</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "id",
            "description": "<p>Unique ID of User</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "validated",
            "description": "<p>Has the user's email address been validated</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "username",
            "description": "<p>Unique Username</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>Unique Email</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "allowedValues": [
              "\"user\"",
              "\"read\"",
              "\"disabled\"",
              "\"admin\""
            ],
            "optional": false,
            "field": "access",
            "description": "<p>The access level of a given user</p>"
          }
        ]
      }
    },
    "filename": "./routes/user.js",
    "groupTitle": "User"
  },
  {
    "type": "get",
    "url": "/api/user",
    "title": "List Users",
    "version": "1.0.0",
    "name": "ListUsers",
    "group": "User",
    "permission": [
      {
        "name": "user",
        "title": "User",
        "description": "<p>A user must be logged in to use this endpoint</p>"
      }
    ],
    "description": "<p>Return a list of users that have registered with the service</p>",
    "parameter": {
      "fields": {
        "Query": [
          {
            "group": "Query",
            "type": "Integer",
            "size": "1 - 100",
            "optional": true,
            "field": "limit",
            "defaultValue": "100",
            "description": "<p>Limit number of returned items</p>"
          },
          {
            "group": "Query",
            "type": "Integer",
            "size": "0 - ∞",
            "optional": true,
            "field": "page",
            "defaultValue": "0",
            "description": "<p>The page, based on the limit, to return</p>"
          },
          {
            "group": "Query",
            "type": "String",
            "optional": true,
            "field": "filter",
            "defaultValue": "",
            "description": "<p>Filter a complete or partial username/email</p>"
          },
          {
            "group": "Query",
            "type": "String",
            "allowedValues": [
              "\"user\"",
              "\"read\"",
              "\"disabled\"",
              "\"admin\""
            ],
            "optional": true,
            "field": "access",
            "description": "<p>The access level of a given user</p>"
          },
          {
            "group": "Query",
            "type": "String",
            "allowedValues": [
              "\"desc\"",
              "\"asc\""
            ],
            "optional": true,
            "field": "order",
            "defaultValue": "asc",
            "description": "<p>Sort order to apply to results</p>"
          },
          {
            "group": "Query",
            "type": "String",
            "allowedValues": [
              "\"id\"",
              "\"created\"",
              "\"username\"",
              "\"access\"",
              "\"validated\"",
              "\"email\""
            ],
            "optional": true,
            "field": "sort",
            "defaultValue": "created",
            "description": "<p>Field to sort order by</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "total",
            "description": "<p>Total number of users with the service</p>"
          },
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "users",
            "description": "<p>undefined undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "users.id",
            "description": "<p>Unique ID of User</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "users.username",
            "description": "<p>Unique Username</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "users.email",
            "description": "<p>Unique Email</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "allowedValues": [
              "\"user\"",
              "\"read\"",
              "\"disabled\"",
              "\"admin\""
            ],
            "optional": false,
            "field": "users.access",
            "description": "<p>The access level of a given user</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "users.validated",
            "description": "<p>Has the user's email address been validated</p>"
          }
        ]
      }
    },
    "filename": "./routes/user.js",
    "groupTitle": "User"
  },
  {
    "type": "patch",
    "url": "/api/user/:uid",
    "title": "Update User",
    "version": "1.0.0",
    "name": "PatchUser",
    "group": "User",
    "permission": [
      {
        "name": "admin",
        "title": "Admin",
        "description": "<p>The user must be a server admin to use this endpoint</p>"
      }
    ],
    "description": "<p>Update information about a given user</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": ":uid",
            "description": "<p>The UID of the user to update</p>"
          }
        ],
        "Body": [
          {
            "group": "Body",
            "type": "String",
            "allowedValues": [
              "\"user\"",
              "\"read\"",
              "\"disabled\"",
              "\"admin\""
            ],
            "optional": true,
            "field": "access",
            "description": "<p>The access level of a given user</p>"
          },
          {
            "group": "Body",
            "type": "Boolean",
            "optional": true,
            "field": "validated",
            "description": "<p>Has the user's email address been validated</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "id",
            "description": "<p>Unique ID of User</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "validated",
            "description": "<p>Has the user's email address been validated</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "username",
            "description": "<p>Unique Username</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>Unique Email</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "allowedValues": [
              "\"user\"",
              "\"read\"",
              "\"disabled\"",
              "\"admin\""
            ],
            "optional": false,
            "field": "access",
            "description": "<p>The access level of a given user</p>"
          }
        ]
      }
    },
    "filename": "./routes/user.js",
    "groupTitle": "User"
  }
] });
