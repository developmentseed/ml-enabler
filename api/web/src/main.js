import { createApp } from 'vue'
import * as VueRouter from 'vue-router'

import 'floating-vue/dist/style.css'
import FloatingVue from 'floating-vue'

import App from './App.vue'

import std from './std.js';
std();

import Home from './components/Home.vue';
import Login from './components/Login.vue';
import Lost from './components/Lost.vue';
import Forgot from './components/Forgot.vue';
import Verify from './components/Verify.vue';
import Register from './components/Register.vue';
import Reset from './components/Reset.vue';
import Project from './components/Project.vue';
import Profile from './components/Profile.vue';
import Admin from './components/Admin.vue';
import CreateProject from './components/CreateProject.vue';
import EditProject from './components/EditProject.vue';
import Iteration from './components/Iteration.vue';
import Imagery from './components/Imagery.vue';
import Integration from './components/Integration.vue';
import CreateIteration from './components/CreateIteration.vue';

import Config from './components/iteration/Config.vue';
import Assets from './components/iteration/Assets.vue';
import Export  from './components/iteration/Export.vue';
import Map  from './components/iteration/Map.vue';
import Stack from './components/iteration/Stack.vue';
import PredTasks from './components/iteration/PredTasks.vue';
import TaskLogs from './components/iteration/tasks/Logs.vue';

const router = new VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(),
    routes: [
        { path: '/', name: 'home', component: Home },

        { path: '/login', name: 'login', component: Login },
        { path: '/login/forgot', name: 'forgot', component: Forgot },
        { path: '/login/verify', name: 'verify', component: Verify },
        { path: '/login/reset', name: 'reset', component: Reset },
        { path: '/login/register', name: 'register', component: Register },


        { path: '/profile', name: 'profile', component: Profile },

        { path: '/admin', name: 'admin', component: Admin },

        { path: '/project/new', name: 'newproject', component: CreateProject },

        {
            path: '/project/:projectid',
            name: 'project',
            component: Project,
            children: [{
                path: 'edit',
                name: 'editproject',
                component: EditProject,
            },{
                path: '/project/:projectid/training',
                name: 'createTraining',
                component: CreateIteration
            },{
                path: '/project/:projectid/iteration',
                name: 'createIteration',
                component: CreateIteration
            },{
                path: '/project/:projectid/imagery',
                name: 'createImagery',
                component: Imagery,
            },{
                path: '/project/:projectid/imagery/:imageryid',
                name: 'editImagery',
                component: Imagery,
            },{
                path: '/project/:projectid/integration',
                name: 'createIntegration',
                component: Integration,
            },{
                path: '/project/:projectid/integration/:integrationid',
                name: 'editIntegration',
                component: Integration,
            },{
                name: 'iteration',
                path: '/project/:projectid/iteration/:iterationid',
                redirect: {
                    name: 'assets'
                },
                component: Iteration,
                children: [{
                    name: 'config',
                    path: '/project/:projectid/iteration/:iterationid/config',
                    component: Config
                },{
                    name: 'assets',
                    path: '/project/:projectid/iteration/:iterationid/assets',
                    component: Assets
                },{
                    name: 'stack',
                    path: '/project/:projectid/iteration/:iterationid/stack',
                    component: Stack
                },{
                    name: 'tasks',
                    path: '/project/:projectid/iteration/:iterationid/tasks',
                    component: PredTasks,
                },{
                    name: 'tasklogs',
                    path: '/project/:projectid/iteration/:iterationid/tasks/:taskid/logs',
                    component: TaskLogs
                },{
                    name: 'map',
                    path: '/project/:projectid/iteration/:iterationid/map',
                    component: Map
                },{
                    name: 'export',
                    path: '/project/:projectid/iteration/:iterationid/export',
                    component: Export
                }]
            }]
        },

        { path: '/.*', name: 'lost', component: Lost }
    ]
});

window.api = window.location.origin

const app = createApp(App);
app.config.devtools = true
app.use(router);
app.use(FloatingVue);
app.mount('#app');
