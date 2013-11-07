App.directive('onEnter', ['KeyboardHandler', function(KeyboardHandler)
{
    var linker = function(scope, element, attrs)
    {
        KeyboardHandler.listen(13, scope[attrs.onEnter])
    };

    return {
        restrict: 'A',
        link: linker
    }
}]);