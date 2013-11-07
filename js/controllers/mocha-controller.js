App.controller('MochaCtrl', [
    '$rootScope', '$scope', '$http', 'LogService', 'PlayerService',
    function($rootScope, $scope, $http, Log, Player)
    {
        $scope.vastUrl = 'http://localhost/vast-client-js/test/staticparser-noad.xml';

        describe('Vast URL', function()
        {
            it('Is valid URL', function(done)
            {
                $.get($scope.vastUrl).always(function(res, status, evt)
                {
                    switch (status)
                    {
                        case 'success':
                            done();
                            break;

                        case 'parsererror':
                            throw new Error('Document is not well-formed');
                            break;

                        case 'error':
                            // throw 'fdsfs';
                        default:
                    }
                });
            });
        });

        mocha.checkLeaks();
        mocha.globals(['jQuery']);
        mocha.run();
    }
]);