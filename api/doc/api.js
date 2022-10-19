
/**
* @api {get} /schema GET /schema
* @apiVersion 1.0.0
* @apiName GET-/schema
* @apiGroup Default
* @apiPermission Unknown
*
* @apidescription
*   No Description
*

*
* @apiSchema (Query) {jsonschema=../schema/req.query.ListSchema.json} apiParam
*
* @apiSchema {jsonschema=../schema/res.ListSchema.json} apiSuccess
*/


/**
* @api {get} /login GET /login
* @apiVersion 1.0.0
* @apiName GET-/login
* @apiGroup Default
* @apiPermission Unknown
*
* @apidescription
*   No Description
*

*
*
*
* @apiSchema {jsonschema=../schema/res.Login.json} apiSuccess
*/


/**
* @api {post} /login POST /login
* @apiVersion 1.0.0
* @apiName POST-/login
* @apiGroup Default
* @apiPermission Unknown
*
* @apidescription
*   No Description
*

*
*
* @apiSchema (Body) {jsonschema=../schema/req.body.CreateLogin.json} apiParam
* @apiSchema {jsonschema=../schema/res.Login.json} apiSuccess
*/


/**
* @api {post} /login/verify POST /login/verify
* @apiVersion 1.0.0
* @apiName POST-/login/verify
* @apiGroup Default
* @apiPermission Unknown
*
* @apidescription
*   No Description
*

*
*
* @apiSchema (Body) {jsonschema=../schema/req.body.VerifyLogin.json} apiParam
* @apiSchema {jsonschema=../schema/res.Standard.json} apiSuccess
*/


/**
* @api {post} /login/forgot POST /login/forgot
* @apiVersion 1.0.0
* @apiName POST-/login/forgot
* @apiGroup Default
* @apiPermission Unknown
*
* @apidescription
*   No Description
*

*
*
* @apiSchema (Body) {jsonschema=../schema/req.body.ForgotLogin.json} apiParam
* @apiSchema {jsonschema=../schema/res.Standard.json} apiSuccess
*/


/**
* @api {post} /login/reset POST /login/reset
* @apiVersion 1.0.0
* @apiName POST-/login/reset
* @apiGroup Default
* @apiPermission Unknown
*
* @apidescription
*   No Description
*

*
*
* @apiSchema (Body) {jsonschema=../schema/req.body.ResetLogin.json} apiParam
* @apiSchema {jsonschema=../schema/res.Standard.json} apiSuccess
*/


/**
* @api {get} /mapbox GET /mapbox
* @apiVersion 1.0.0
* @apiName GET-/mapbox
* @apiGroup Default
* @apiPermission Unknown
*
* @apidescription
*   No Description
*

*
*
*
* @apiSchema {jsonschema=../schema/res.Mapbox.json} apiSuccess
*/


/**
* @api {get} /meta GET /meta
* @apiVersion 1.0.0
* @apiName GET-/meta
* @apiGroup Default
* @apiPermission Unknown
*
* @apidescription
*   No Description
*

*
* @apiSchema (Query) {jsonschema=../schema/req.query.ListMeta.json} apiParam
*
* @apiSchema {jsonschema=../schema/res.ListMeta.json} apiSuccess
*/


/**
* @api {post} /meta POST /meta
* @apiVersion 1.0.0
* @apiName POST-/meta
* @apiGroup Default
* @apiPermission Unknown
*
* @apidescription
*   No Description
*

*
*
* @apiSchema (Body) {jsonschema=../schema/req.body.CreateMeta.json} apiParam
* @apiSchema {jsonschema=../schema/res.Meta.json} apiSuccess
*/


/**
* @api {patch} /meta/:key PATCH /meta/:key
* @apiVersion 1.0.0
* @apiName PATCH-/meta/:key
* @apiGroup Default
* @apiPermission Unknown
*
* @apidescription
*   No Description
*
* @apiParam {string} key param
*
*
* @apiSchema (Body) {jsonschema=../schema/req.body.PatchMeta.json} apiParam
* @apiSchema {jsonschema=../schema/res.Meta.json} apiSuccess
*/


/**
* @api {delete} /meta/:key DELETE /meta/:key
* @apiVersion 1.0.0
* @apiName DELETE-/meta/:key
* @apiGroup Default
* @apiPermission Unknown
*
* @apidescription
*   No Description
*
* @apiParam {string} key param
*
*
*
* @apiSchema {jsonschema=../schema/res.Standard.json} apiSuccess
*/


/**
* @api {get} /project/:pid/user GET /project/:pid/user
* @apiVersion 1.0.0
* @apiName GET-/project/:pid/user
* @apiGroup Default
* @apiPermission Unknown
*
* @apidescription
*   No Description
*
* @apiParam {integer} pid param
*
* @apiSchema (Query) {jsonschema=../schema/req.query.ListProjectAccess.json} apiParam
*
* @apiSchema {jsonschema=../schema/res.ListProjectAccess.json} apiSuccess
*/


/**
* @api {post} /project/:pid/user POST /project/:pid/user
* @apiVersion 1.0.0
* @apiName POST-/project/:pid/user
* @apiGroup Default
* @apiPermission Unknown
*
* @apidescription
*   No Description
*
* @apiParam {integer} pid param
* @apiParam {integer} id param
*
*
* @apiSchema (Body) {jsonschema=../schema/req.body.CreateProjectAccess.json} apiParam
* @apiSchema {jsonschema=../schema/res.ListProjectAccess.json} apiSuccess
*/


/**
* @api {patch} /project/:pid/user/:id PATCH /project/:pid/user/:id
* @apiVersion 1.0.0
* @apiName PATCH-/project/:pid/user/:id
* @apiGroup Default
* @apiPermission Unknown
*
* @apidescription
*   No Description
*
* @apiParam {integer} pid param
* @apiParam {integer} id param
*
*
* @apiSchema (Body) {jsonschema=../schema/req.body.PatchProjectAccess.json} apiParam
* @apiSchema {jsonschema=../schema/res.ProjectAccess.json} apiSuccess
*/


/**
* @api {get} /project/:pid/aoi GET /project/:pid/aoi
* @apiVersion 1.0.0
* @apiName GET-/project/:pid/aoi
* @apiGroup Default
* @apiPermission Unknown
*
* @apidescription
*   No Description
*
* @apiParam {integer} pid param
*
* @apiSchema (Query) {jsonschema=../schema/req.query.ListAOI.json} apiParam
*
* @apiSchema {jsonschema=../schema/res.ListAOI.json} apiSuccess
*/


/**
* @api {post} /project/:pid/aoi POST /project/:pid/aoi
* @apiVersion 1.0.0
* @apiName POST-/project/:pid/aoi
* @apiGroup Default
* @apiPermission Unknown
*
* @apidescription
*   No Description
*
* @apiParam {integer} pid param
*
*
* @apiSchema (Body) {jsonschema=../schema/req.body.CreateAOI.json} apiParam
* @apiSchema {jsonschema=../schema/res.AOI.json} apiSuccess
*/


/**
* @api {get} /project/:pid/aoi/:aoiid GET /project/:pid/aoi/:aoiid
* @apiVersion 1.0.0
* @apiName GET-/project/:pid/aoi/:aoiid
* @apiGroup Default
* @apiPermission Unknown
*
* @apidescription
*   No Description
*
* @apiParam {integer} pid param
* @apiParam {integer} aoiid param
*
*
*
* @apiSchema {jsonschema=../schema/res.AOI.json} apiSuccess
*/


/**
* @api {patch} /project/:pid/aoi/:aoiid PATCH /project/:pid/aoi/:aoiid
* @apiVersion 1.0.0
* @apiName PATCH-/project/:pid/aoi/:aoiid
* @apiGroup Default
* @apiPermission Unknown
*
* @apidescription
*   No Description
*
* @apiParam {integer} pid param
* @apiParam {integer} aoiid param
*
*
* @apiSchema (Body) {jsonschema=../schema/req.body.PatchAOI.json} apiParam
* @apiSchema {jsonschema=../schema/res.AOI.json} apiSuccess
*/


/**
* @api {delete} /project/:pid/aoi/:aoiid DELETE /project/:pid/aoi/:aoiid
* @apiVersion 1.0.0
* @apiName DELETE-/project/:pid/aoi/:aoiid
* @apiGroup Default
* @apiPermission Unknown
*
* @apidescription
*   No Description
*
* @apiParam {integer} pid param
* @apiParam {integer} aoiid param
*
*
*
* @apiSchema {jsonschema=../schema/res.Standard.json} apiSuccess
*/


/**
* @api {get} /project/:pid/imagery GET /project/:pid/imagery
* @apiVersion 1.0.0
* @apiName GET-/project/:pid/imagery
* @apiGroup Default
* @apiPermission Unknown
*
* @apidescription
*   No Description
*
* @apiParam {integer} pid param
*
* @apiSchema (Query) {jsonschema=../schema/req.query.ListImagery.json} apiParam
*
* @apiSchema {jsonschema=../schema/res.ListImagery.json} apiSuccess
*/


/**
* @api {post} /project/:pid/imagery POST /project/:pid/imagery
* @apiVersion 1.0.0
* @apiName POST-/project/:pid/imagery
* @apiGroup Default
* @apiPermission Unknown
*
* @apidescription
*   No Description
*
* @apiParam {integer} pid param
*
*
* @apiSchema (Body) {jsonschema=../schema/req.body.CreateImagery.json} apiParam
* @apiSchema {jsonschema=../schema/res.Imagery.json} apiSuccess
*/


/**
* @api {get} /project/:pid/imagery/:imageryid GET /project/:pid/imagery/:imageryid
* @apiVersion 1.0.0
* @apiName GET-/project/:pid/imagery/:imageryid
* @apiGroup Default
* @apiPermission Unknown
*
* @apidescription
*   No Description
*
* @apiParam {integer} pid param
* @apiParam {integer} imageryid param
*
*
*
* @apiSchema {jsonschema=../schema/res.Imagery.json} apiSuccess
*/


/**
* @api {patch} /project/:pid/imagery/:imageryid PATCH /project/:pid/imagery/:imageryid
* @apiVersion 1.0.0
* @apiName PATCH-/project/:pid/imagery/:imageryid
* @apiGroup Default
* @apiPermission Unknown
*
* @apidescription
*   No Description
*
* @apiParam {integer} pid param
* @apiParam {integer} imageryid param
*
*
* @apiSchema (Body) {jsonschema=../schema/req.body.PatchImagery.json} apiParam
* @apiSchema {jsonschema=../schema/res.Imagery.json} apiSuccess
*/


/**
* @api {delete} /project/:pid/imagery/:imageryid DELETE /project/:pid/imagery/:imageryid
* @apiVersion 1.0.0
* @apiName DELETE-/project/:pid/imagery/:imageryid
* @apiGroup Default
* @apiPermission Unknown
*
* @apidescription
*   No Description
*
* @apiParam {integer} pid param
* @apiParam {integer} imageryid param
*
*
*
* @apiSchema {jsonschema=../schema/res.Standard.json} apiSuccess
*/


/**
* @api {get} /project/:pid/integration GET /project/:pid/integration
* @apiVersion 1.0.0
* @apiName GET-/project/:pid/integration
* @apiGroup Default
* @apiPermission Unknown
*
* @apidescription
*   No Description
*
* @apiParam {integer} pid param
*
* @apiSchema (Query) {jsonschema=../schema/req.query.ListIntegrations.json} apiParam
*
* @apiSchema {jsonschema=../schema/res.ListIntegrations.json} apiSuccess
*/


/**
* @api {post} /project/:pid/integration POST /project/:pid/integration
* @apiVersion 1.0.0
* @apiName POST-/project/:pid/integration
* @apiGroup Default
* @apiPermission Unknown
*
* @apidescription
*   No Description
*
* @apiParam {integer} pid param
*
*
* @apiSchema (Body) {jsonschema=../schema/req.body.CreateIntegration.json} apiParam
* @apiSchema {jsonschema=../schema/res.Integration.json} apiSuccess
*/


/**
* @api {get} /project/:pid/integration/:integrationid GET /project/:pid/integration/:integrationid
* @apiVersion 1.0.0
* @apiName GET-/project/:pid/integration/:integrationid
* @apiGroup Default
* @apiPermission Unknown
*
* @apidescription
*   No Description
*
* @apiParam {integer} pid param
* @apiParam {integer} integrationid param
*
*
*
* @apiSchema {jsonschema=../schema/res.Integration.json} apiSuccess
*/


/**
* @api {delete} /project/:pid/integration/:integrationid DELETE /project/:pid/integration/:integrationid
* @apiVersion 1.0.0
* @apiName DELETE-/project/:pid/integration/:integrationid
* @apiGroup Default
* @apiPermission Unknown
*
* @apidescription
*   No Description
*
* @apiParam {integer} pid param
* @apiParam {integer} integrationid param
*
*
*
* @apiSchema {jsonschema=../schema/res.Standard.json} apiSuccess
*/


/**
* @api {post} /project/:pid/iteration/:iterationid/asset POST /project/:pid/iteration/:iterationid/asset
* @apiVersion 1.0.0
* @apiName POST-/project/:pid/iteration/:iterationid/asset
* @apiGroup Default
* @apiPermission Unknown
*
* @apidescription
*   No Description
*
* @apiParam {integer} pid param
* @apiParam {integer} iterationid param
*
* @apiSchema (Query) {jsonschema=../schema/req.query.UploadIterationAsset.json} apiParam
*
* @apiSchema {jsonschema=../schema/res.Iteration.json} apiSuccess
*/


/**
* @api {get} /project/:pid/iteration/:iterationid/asset GET /project/:pid/iteration/:iterationid/asset
* @apiVersion 1.0.0
* @apiName GET-/project/:pid/iteration/:iterationid/asset
* @apiGroup Default
* @apiPermission Unknown
*
* @apidescription
*   No Description
*
* @apiParam {integer} pid param
* @apiParam {integer} iterationid param
*
* @apiSchema (Query) {jsonschema=../schema/req.query.DownloadIterationAsset.json} apiParam
*
*
*/


/**
* @api {get} /project/:pid/iteration/:iterationid/export GET /project/:pid/iteration/:iterationid/export
* @apiVersion 1.0.0
* @apiName GET-/project/:pid/iteration/:iterationid/export
* @apiGroup Default
* @apiPermission Unknown
*
* @apidescription
*   No Description
*
* @apiParam {integer} pid param
* @apiParam {integer} iterationid param
*
* @apiSchema (Query) {jsonschema=../schema/req.query.GetExport.json} apiParam
*
*
*/


/**
* @api {get} /project/:pid/iteration/:iterationid/stack/queue GET /project/:pid/iteration/:iterationid/stack/queue
* @apiVersion 1.0.0
* @apiName GET-/project/:pid/iteration/:iterationid/stack/queue
* @apiGroup Default
* @apiPermission Unknown
*
* @apidescription
*   No Description
*
* @apiParam {integer} pid param
* @apiParam {integer} iterationid param
*
*
*
* @apiSchema {jsonschema=../schema/res.StackQueue.json} apiSuccess
*/


/**
* @api {delete} /project/:pid/iteration/:iterationid/stack/queue DELETE /project/:pid/iteration/:iterationid/stack/queue
* @apiVersion 1.0.0
* @apiName DELETE-/project/:pid/iteration/:iterationid/stack/queue
* @apiGroup Default
* @apiPermission Unknown
*
* @apidescription
*   No Description
*
* @apiParam {integer} pid param
* @apiParam {integer} iterationid param
*
*
*
* @apiSchema {jsonschema=../schema/res.StackQueue.json} apiSuccess
*/


/**
* @api {post} /project/:pid/iteration/:iterationid/stack/queue POST /project/:pid/iteration/:iterationid/stack/queue
* @apiVersion 1.0.0
* @apiName POST-/project/:pid/iteration/:iterationid/stack/queue
* @apiGroup Default
* @apiPermission Unknown
*
* @apidescription
*   No Description
*
* @apiParam {integer} pid param
* @apiParam {integer} iterationid param
*
*
* @apiSchema (Body) {jsonschema=../schema/req.body.PopulateStackQueue.json} apiParam
* @apiSchema {jsonschema=../schema/res.StackQueue.json} apiSuccess
*/


/**
* @api {get} /project/:pid/iteration/:iterationid/stack GET /project/:pid/iteration/:iterationid/stack
* @apiVersion 1.0.0
* @apiName GET-/project/:pid/iteration/:iterationid/stack
* @apiGroup Default
* @apiPermission Unknown
*
* @apidescription
*   No Description
*
* @apiParam {integer} pid param
* @apiParam {integer} iterationid param
*
*
*
* @apiSchema {jsonschema=../schema/res.Stack.json} apiSuccess
*/


/**
* @api {post} /project/:pid/iteration/:iterationid/stack POST /project/:pid/iteration/:iterationid/stack
* @apiVersion 1.0.0
* @apiName POST-/project/:pid/iteration/:iterationid/stack
* @apiGroup Default
* @apiPermission Unknown
*
* @apidescription
*   No Description
*
* @apiParam {integer} pid param
* @apiParam {integer} iterationid param
*
*
* @apiSchema (Body) {jsonschema=../schema/req.body.CreateStack.json} apiParam
* @apiSchema {jsonschema=../schema/res.Stack.json} apiSuccess
*/


/**
* @api {delete} /project/:pid/iteration/:iterationid/stack DELETE /project/:pid/iteration/:iterationid/stack
* @apiVersion 1.0.0
* @apiName DELETE-/project/:pid/iteration/:iterationid/stack
* @apiGroup Default
* @apiPermission Unknown
*
* @apidescription
*   No Description
*
* @apiParam {integer} pid param
* @apiParam {integer} iterationid param
*
*
*
* @apiSchema {jsonschema=../schema/res.Standard.json} apiSuccess
*/


/**
* @api {get} /project/:pid/iteration/:iterationid/submission GET /project/:pid/iteration/:iterationid/submission
* @apiVersion 1.0.0
* @apiName GET-/project/:pid/iteration/:iterationid/submission
* @apiGroup Default
* @apiPermission Unknown
*
* @apidescription
*   No Description
*
* @apiParam {integer} pid param
* @apiParam {integer} iterationid param
*
* @apiSchema (Query) {jsonschema=../schema/req.query.ListSubmissions.json} apiParam
*
* @apiSchema {jsonschema=../schema/res.ListSubmission.json} apiSuccess
*/


/**
* @api {get} /project/:pid/iteration/:iterationid/submission/:subid GET /project/:pid/iteration/:iterationid/submission/:subid
* @apiVersion 1.0.0
* @apiName GET-/project/:pid/iteration/:iterationid/submission/:subid
* @apiGroup Default
* @apiPermission Unknown
*
* @apidescription
*   No Description
*
* @apiParam {integer} pid param
* @apiParam {integer} iterationid param
* @apiParam {integer} subid param
*
*
*
* @apiSchema {jsonschema=../schema/res.Task.json} apiSuccess
*/


/**
* @api {get} /project/:pid/iteration/:iterationid/submission/:subid/tiles GET /project/:pid/iteration/:iterationid/submission/:subid/tiles
* @apiVersion 1.0.0
* @apiName GET-/project/:pid/iteration/:iterationid/submission/:subid/tiles
* @apiGroup Default
* @apiPermission Unknown
*
* @apidescription
*   No Description
*
* @apiParam {integer} pid param
* @apiParam {integer} iterationid param
* @apiParam {integer} subid param
*
*
*
* @apiSchema {jsonschema=../schema/res.TileJSON.json} apiSuccess
*/


/**
* @api {get} /project/:pid/iteration/:iterationid/submission/:subid/tiles/:z/:x/:y.:format GET /project/:pid/iteration/:iterationid/submission/:subid/tiles/:z/:x/:y.:format
* @apiVersion 1.0.0
* @apiName GET-/project/:pid/iteration/:iterationid/submission/:subid/tiles/:z/:x/:y.:format
* @apiGroup Default
* @apiPermission Unknown
*
* @apidescription
*   No Description
*
* @apiParam {integer} pid param
* @apiParam {integer} iterationid param
* @apiParam {integer} subid param
* @apiParam {integer} z param
* @apiParam {integer} x param
* @apiParam {integer} y param
* @apiParam {string} format param
*
*
*
*
*/


/**
* @api {post} /project/:pid/iteration/:iterationid/task POST /project/:pid/iteration/:iterationid/task
* @apiVersion 1.0.0
* @apiName POST-/project/:pid/iteration/:iterationid/task
* @apiGroup Default
* @apiPermission Unknown
*
* @apidescription
*   No Description
*
* @apiParam {integer} pid param
* @apiParam {integer} iterationid param
*
*
* @apiSchema (Body) {jsonschema=../schema/req.body.CreateTask.json} apiParam
* @apiSchema {jsonschema=../schema/res.Task.json} apiSuccess
*/


/**
* @api {get} /project/:pid/iteration/:iterationid/task GET /project/:pid/iteration/:iterationid/task
* @apiVersion 1.0.0
* @apiName GET-/project/:pid/iteration/:iterationid/task
* @apiGroup Default
* @apiPermission Unknown
*
* @apidescription
*   No Description
*
* @apiParam {integer} pid param
* @apiParam {integer} iterationid param
*
* @apiSchema (Query) {jsonschema=../schema/req.query.ListTasks.json} apiParam
*
* @apiSchema {jsonschema=../schema/res.ListTasks.json} apiSuccess
*/


/**
* @api {get} /project/:pid/iteration/:iterationid/task/:taskid/logs GET /project/:pid/iteration/:iterationid/task/:taskid/logs
* @apiVersion 1.0.0
* @apiName GET-/project/:pid/iteration/:iterationid/task/:taskid/logs
* @apiGroup Default
* @apiPermission Unknown
*
* @apidescription
*   No Description
*
* @apiParam {integer} pid param
* @apiParam {integer} iterationid param
* @apiParam {integer} taskid param
*
*
*
* @apiSchema {jsonschema=../schema/res.Task.json} apiSuccess
*/


/**
* @api {get} /project/:pid/iteration/:iterationid/task/:taskid GET /project/:pid/iteration/:iterationid/task/:taskid
* @apiVersion 1.0.0
* @apiName GET-/project/:pid/iteration/:iterationid/task/:taskid
* @apiGroup Default
* @apiPermission Unknown
*
* @apidescription
*   No Description
*
* @apiParam {integer} pid param
* @apiParam {integer} iterationid param
* @apiParam {integer} taskid param
*
*
*
* @apiSchema {jsonschema=../schema/res.Task.json} apiSuccess
*/


/**
* @api {patch} /project/:pid/iteration/:iterationid/task/:taskid PATCH /project/:pid/iteration/:iterationid/task/:taskid
* @apiVersion 1.0.0
* @apiName PATCH-/project/:pid/iteration/:iterationid/task/:taskid
* @apiGroup Default
* @apiPermission Unknown
*
* @apidescription
*   No Description
*
* @apiParam {integer} pid param
* @apiParam {integer} iterationid param
* @apiParam {integer} taskid param
*
*
* @apiSchema (Body) {jsonschema=../schema/req.body.PatchTask.json} apiParam
* @apiSchema {jsonschema=../schema/res.Task.json} apiSuccess
*/


/**
* @api {delete} /project/:pid/iteration/:iterationid/task/:taskid DELETE /project/:pid/iteration/:iterationid/task/:taskid
* @apiVersion 1.0.0
* @apiName DELETE-/project/:pid/iteration/:iterationid/task/:taskid
* @apiGroup Default
* @apiPermission Unknown
*
* @apidescription
*   No Description
*
* @apiParam {integer} pid param
* @apiParam {integer} iterationid param
* @apiParam {integer} taskid param
*
*
*
* @apiSchema {jsonschema=../schema/res.Standard.json} apiSuccess
*/


/**
* @api {get} /project/:pid/iteration GET /project/:pid/iteration
* @apiVersion 1.0.0
* @apiName GET-/project/:pid/iteration
* @apiGroup Default
* @apiPermission Unknown
*
* @apidescription
*   No Description
*
* @apiParam {integer} pid param
*
* @apiSchema (Query) {jsonschema=../schema/req.query.ListIterations.json} apiParam
*
* @apiSchema {jsonschema=../schema/res.ListIterations.json} apiSuccess
*/


/**
* @api {post} /project/:pid/iteration POST /project/:pid/iteration
* @apiVersion 1.0.0
* @apiName POST-/project/:pid/iteration
* @apiGroup Default
* @apiPermission Unknown
*
* @apidescription
*   No Description
*
* @apiParam {integer} pid param
*
*
* @apiSchema (Body) {jsonschema=../schema/req.body.CreateIteration.json} apiParam
* @apiSchema {jsonschema=../schema/res.Iteration.json} apiSuccess
*/


/**
* @api {get} /project/:pid/iteration/latest GET /project/:pid/iteration/latest
* @apiVersion 1.0.0
* @apiName GET-/project/:pid/iteration/latest
* @apiGroup Default
* @apiPermission Unknown
*
* @apidescription
*   No Description
*
* @apiParam {integer} pid param
*
*
*
* @apiSchema {jsonschema=../schema/res.Iteration.json} apiSuccess
*/


/**
* @api {get} /project/:pid/iteration/:iterationid GET /project/:pid/iteration/:iterationid
* @apiVersion 1.0.0
* @apiName GET-/project/:pid/iteration/:iterationid
* @apiGroup Default
* @apiPermission Unknown
*
* @apidescription
*   No Description
*
* @apiParam {integer} pid param
* @apiParam {integer} iterationid param
*
*
*
* @apiSchema {jsonschema=../schema/res.Iteration.json} apiSuccess
*/


/**
* @api {patch} /project/:pid/iteration/:iterationid PATCH /project/:pid/iteration/:iterationid
* @apiVersion 1.0.0
* @apiName PATCH-/project/:pid/iteration/:iterationid
* @apiGroup Default
* @apiPermission Unknown
*
* @apidescription
*   No Description
*
* @apiParam {integer} pid param
* @apiParam {integer} iterationid param
*
*
* @apiSchema (Body) {jsonschema=../schema/req.body.PatchIteration.json} apiParam
* @apiSchema {jsonschema=../schema/res.Iteration.json} apiSuccess
*/


/**
* @api {get} /project GET /project
* @apiVersion 1.0.0
* @apiName GET-/project
* @apiGroup Default
* @apiPermission Unknown
*
* @apidescription
*   No Description
*

*
* @apiSchema (Query) {jsonschema=../schema/req.query.ListProjects.json} apiParam
*
* @apiSchema {jsonschema=../schema/res.ListProjects.json} apiSuccess
*/


/**
* @api {post} /project POST /project
* @apiVersion 1.0.0
* @apiName POST-/project
* @apiGroup Default
* @apiPermission Unknown
*
* @apidescription
*   No Description
*

*
*
* @apiSchema (Body) {jsonschema=../schema/req.body.CreateProject.json} apiParam
* @apiSchema {jsonschema=../schema/res.Project.json} apiSuccess
*/


/**
* @api {get} /project/:pid GET /project/:pid
* @apiVersion 1.0.0
* @apiName GET-/project/:pid
* @apiGroup Default
* @apiPermission Unknown
*
* @apidescription
*   No Description
*
* @apiParam {integer} pid param
*
*
*
* @apiSchema {jsonschema=../schema/res.Project.json} apiSuccess
*/


/**
* @api {patch} /project/:pid PATCH /project/:pid
* @apiVersion 1.0.0
* @apiName PATCH-/project/:pid
* @apiGroup Default
* @apiPermission Unknown
*
* @apidescription
*   No Description
*
* @apiParam {integer} pid param
*
*
* @apiSchema (Body) {jsonschema=../schema/req.body.PatchProject.json} apiParam
* @apiSchema {jsonschema=../schema/res.Project.json} apiSuccess
*/


/**
* @api {delete} /project/:pid DELETE /project/:pid
* @apiVersion 1.0.0
* @apiName DELETE-/project/:pid
* @apiGroup Default
* @apiPermission Unknown
*
* @apidescription
*   No Description
*
* @apiParam {integer} pid param
*
*
*
* @apiSchema {jsonschema=../schema/res.Standard.json} apiSuccess
*/


/**
* @api {post} /sns POST /sns
* @apiVersion 1.0.0
* @apiName POST-/sns
* @apiGroup Default
* @apiPermission Unknown
*
* @apidescription
*   No Description
*

*
*
*
* @apiSchema {jsonschema=../schema/res.Standard.json} apiSuccess
*/


/**
* @api {get} /stack GET /stack
* @apiVersion 1.0.0
* @apiName GET-/stack
* @apiGroup Default
* @apiPermission Unknown
*
* @apidescription
*   No Description
*

*
* @apiSchema (Query) {jsonschema=../schema/req.query.ListStacks.json} apiParam
*
* @apiSchema {jsonschema=../schema/res.ListStacks.json} apiSuccess
*/


/**
* @api {get} /token GET /token
* @apiVersion 1.0.0
* @apiName GET-/token
* @apiGroup Default
* @apiPermission Unknown
*
* @apidescription
*   No Description
*

*
* @apiSchema (Query) {jsonschema=../schema/req.query.ListTokens.json} apiParam
*
* @apiSchema {jsonschema=../schema/res.ListTokens.json} apiSuccess
*/


/**
* @api {post} /token POST /token
* @apiVersion 1.0.0
* @apiName POST-/token
* @apiGroup Default
* @apiPermission Unknown
*
* @apidescription
*   No Description
*

*
*
* @apiSchema (Body) {jsonschema=../schema/req.body.CreateToken.json} apiParam
* @apiSchema {jsonschema=../schema/res.CreateToken.json} apiSuccess
*/


/**
* @api {get} /token/:token_id GET /token/:token_id
* @apiVersion 1.0.0
* @apiName GET-/token/:token_id
* @apiGroup Default
* @apiPermission Unknown
*
* @apidescription
*   No Description
*
* @apiParam {integer} token_id param
*
*
*
* @apiSchema {jsonschema=../schema/res.Token.json} apiSuccess
*/


/**
* @api {delete} /token/:token_id DELETE /token/:token_id
* @apiVersion 1.0.0
* @apiName DELETE-/token/:token_id
* @apiGroup Default
* @apiPermission Unknown
*
* @apidescription
*   No Description
*
* @apiParam {integer} token_id param
*
*
*
* @apiSchema {jsonschema=../schema/res.Standard.json} apiSuccess
*/


/**
* @api {get} /user GET /user
* @apiVersion 1.0.0
* @apiName GET-/user
* @apiGroup Default
* @apiPermission Unknown
*
* @apidescription
*   No Description
*

*
*
*
* @apiSchema {jsonschema=../schema/res.ListUsers.json} apiSuccess
*/


/**
* @api {post} /user POST /user
* @apiVersion 1.0.0
* @apiName POST-/user
* @apiGroup Default
* @apiPermission Unknown
*
* @apidescription
*   No Description
*

*
*
* @apiSchema (Body) {jsonschema=../schema/req.body.CreateUser.json} apiParam
* @apiSchema {jsonschema=../schema/res.User.json} apiSuccess
*/


/**
* @api {patch} /user/:uid PATCH /user/:uid
* @apiVersion 1.0.0
* @apiName PATCH-/user/:uid
* @apiGroup Default
* @apiPermission Unknown
*
* @apidescription
*   No Description
*
* @apiParam {integer} uid param
*
*
* @apiSchema (Body) {jsonschema=../schema/req.body.PatchUser.json} apiParam
* @apiSchema {jsonschema=../schema/res.User.json} apiSuccess
*/
