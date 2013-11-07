App.directive('modal', function($rootScope, $http, $compile)
{
    var linker = function(scope, element, attrs)
    {
        var $modalElt = element.find('.modal');

        $rootScope.Modal = {
            elt: element,
            open: function(title, template, data)
            {
                var self = this;
                scope.modal = {
                    title: title,
                    template: template,
                    content: data
                };

                $modalElt.modal();
            }
        };
    };

    return {
        restrict: 'E',
        scope: {},
        link: linker,
        templateUrl: 'views/modal.html'
    }
});