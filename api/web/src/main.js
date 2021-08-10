import Vue from 'vue'
import VueRouter from  'vue-router'
import App from './App.vue'

import std from './std.js';
std();

import Home from './components/Home.vue';
import Login from './components/Login.vue';
import Project from './components/Project.vue';
import Profile from './components/Profile.vue';
import CreateProject from './components/CreateProject.vue';
import EditProject from './components/EditProject.vue';
import Prediction from './components/Prediction.vue';
import Imagery from './components/Imagery.vue';
import Integration from './components/Integration.vue';
import CreateIteration from './components/CreateIteration.vue';

import Config from './components/iteration/Config.vue';
import Assets from './components/iteration/Assets.vue';
import Export  from './components/iteration/Export.vue';
import Map  from './components/iteration/Map.vue';
import Stack from './components/iteration/Stack.vue';
import PredTasks from './components/iteration/PredTasks.vue';

Vue.use(VueRouter);
Vue.config.productionTip = false

const router = new VueRouter({
    mode: 'hash',
    routes: [
        { path: '/', name: 'home', component: Home },
        { path: '/login', name: 'login', component: Login },
        { path: '/profile', name: 'profile', component: Profile },

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
                name: 'createPrediction',
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
                path: '/project/:projectid/integration/:integrationid',
                name: 'editIntegration',
                component: Integration,
            },{
                name: 'iteration',
                path: '/project/:projectid/iteration/:iterationid',
                redirect: '/project/:projectid/iteration/:iterationid/assets',
                component: Prediction,
                children: [{
                    name: 'config',
                    path: 'config',
                    component: Config
                },{
                    name: 'assets',
                    path: 'assets',
                    component: Assets
                },{
                    name: 'stack',
                    path: 'stack',
                    component: Stack
                },{
                    name: 'tasks',
                    path: 'tasks',
                    component: PredTasks
                },{
                    name: 'map',
                    path: 'map',
                    component: Map
                },{
                    name: 'export',
                    path: 'export',
                    component: Export
                }]
            }]
        }
    ]
});

window.api = window.location.origin

new Vue({
    router,
    render: h => h(App)
}).$mount('#app')
