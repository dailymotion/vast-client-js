App.directive('prism', function(KeyboardHandler)
{
    var codeElt, interpolation, compile, controller;

    compile = function(tElement, tAttrs, transclude)
    {
        var _elt = tElement[0],
            tagName = _elt.tagName.toLowerCase();

        if (tagName === 'code')
        {
            codeElt = _elt;
        }
        else
        {
            codeElt = tElement.find('code')[0];
        }

        if (codeElt)
        {
            interpolation = codeElt.innerHTML.replace(/(\{\{ ?| ?\}\})+/g, '');
        }
    };

    controller = function($scope, $element, $attrs)
    {
        if (codeElt && interpolation)
        {
            $scope.$watch(interpolation, function()
            {
                setTimeout(function()
                {
                    Prism.highlightElement(codeElt)
                }, 0);
            });
        }
    };

    return {
        restrict: 'A',
        compile: compile,
        controller: controller
    }
});