'use strict';

// Declare app level module which depends on filters, and services
var App = angular.module('App', ['ngRoute']);

App.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider)
{
    // $locationProvider.html5Mode(true);
    $routeProvider
        .when('/test', { templateUrl: 'views/test.html', controller: 'TestCtrl' })
        .when('/iphone', { templateUrl: 'views/iphone.html', controller: 'IPhoneCtrl' })
        .otherwise({ redirectTo: '/test' });
}]);
