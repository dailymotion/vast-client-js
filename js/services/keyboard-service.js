App.service('KeyboardHandler', [function()
{
    var handler = (function(){

        var clients = {};

        document.addEventListener('keyup', function(e)
        {
            var keyCode = e.keyCode,
                fns = clients[keyCode];

            if (angular.isArray(fns) && fns.length)
            {
                for (var i = 0, len = fns.length; i < len; i++)
                {
                    var fn = fns[i];
                    fn.call(fn);
                }
            }
        });

        return {
            listen: function(keyCode, fn)
            {
                var register = clients[keyCode] || (clients[keyCode] = []);
                register.push(fn);
            }
        }

    }());

    return handler;
}]);