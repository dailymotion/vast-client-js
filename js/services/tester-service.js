App.service('TesterService', function($rootScope)
{
    function TesterService()
    {
        this.list = [];
        this._data = {};
    }

    TesterService.prototype.timeoutDuration = 2000;

    TesterService.prototype.addTest = function(label, fn)
    {
        var self = this;

        this.list.push(new Test({
            label: label,
            fn: fn,
            root: self
        }));

        return this;
    };
    TesterService.prototype.init = function(data)
    {
        angular.extend(this, data);
        return this;
    };
    TesterService.prototype.reset = function()
    {
        console.log('\n%c---- Automatic VAST Testing, Hello There! ----\n', 'color: #428BCA; font-weight: bold;');
        var test;

        this._data.length = 0;
        for (var i = 0, len = this.list.length; i < len; i++)
        {
            test = this.list[i];
            test.reset();
        }
        return this;
    };
    TesterService.prototype.set = function(key, value)
    {
        this._data[key] = value;
        return this;
    };
    TesterService.prototype.get = function(key)
    {
        return this._data[key];
    };
    TesterService.prototype.has = function(key)
    {
        return this._data.hasOwnProperty(key);
    };
    TesterService.prototype.count = function(type)
    {
        var count = 0;

        for (var i = 0, len = this.list.length; i < len; i++)
        {
            test = this.list[i];
            if (!test.started) continue;

            switch (type)
            {
                case 'success':
                    if (test.success === true) count++;
                    break;

                case 'fail':
                    if (test.success === false) count++;
                    break;

                case 'warning':
                    count += test.warnings.length;
                    break;
            }
        }

        return count;
    };
    TesterService.prototype.run = function()
    {
        var runNext, currentTest, index, res, doneFn, failFn, timeout,
            self = this,
            $scope = this.$scope;

        index = 0;

        runNext = function()
        {
            currentTest = self.list[index];
            if (!currentTest) return;

            console.log('%cRunning `'+ currentTest.label +'`', 'font-weight: bold;');
            currentTest.started = true;

            timeout = setTimeout(function()
            {
                failFn.call(self, { message: 'timeout' });
            }, self.timeoutDuration);

            if (currentTest.fn.length >= 1)
            {
                currentTest.fn.call(currentTest, doneFn, failFn);
            }
            else
            {
                res = currentTest.fn.call(currentTest);
                res ? doneFn() : failFn();
            }
        }

        failFn = function(err)
        {
            console.log('   %c✘ fail %O', 'color: #B94A48;', err);

            clearTimeout(timeout);
            timeout = null;

            currentTest.success = false;
            currentTest.error = err;

            $scope && $scope.$apply();
        }

        doneFn = function()
        {
            console.log('   %c✔ success', 'color: #468847;');

            clearTimeout(timeout);
            timeout = null;

            currentTest.success = true;
            index++;
            runNext();

            $scope && $scope.$apply();
        };

        runNext();
    };

    TesterService.prototype.Error = function(label, data)
    {
        this.label = label;
        this.data = data;
        this.stack = null;
    }

    function Modal(data)
    {
        var defaults = {
            link: '+',
            title: '',
            template: null,
            data: null
        };
        angular.extend(this, defaults, data);
    }
    Modal.prototype.open = function()
    {
        if (!this.template) return;

        var modalFn;

        if (modalFn = $rootScope.Modal)
        {
           modalFn.open(this.title, this.template, this.data);
        }
    };

    TesterService.prototype.Modal = Modal;

    // ------------------------------------------------------
    // TestVO
    // ------------------------------------------------------
    function Test(data)
    {
        this.reset();
        angular.extend(this, data);
    }
    Test.prototype.reset = function()
    {
        angular.extend(this, {
            started: false,
            success: null,
            warnings: [],
            error: null,
            data: null,
            modal: null
        });
    };
    Test.prototype.get = function(key)
    {
        return this._data[key];
    };
    Test.prototype.set = function(key, value)
    {
        this._data[key] = value;
    };
    Test.prototype.has = function(key)
    {
        return this._data.hasOwnProperty(key);
    };
    Test.prototype.warn = function(message)
    {
        this.warnings.push(message);
        console.log('   %c⚠%c Warning:%c %s', 'color: #F0AD4E; font-size: 1.5em;', 'color: #F0AD4E; font-weight: bold;', 'color: #F0AD4E; font-weight: normal;', message);
    };


    // ------------------------------------------------------
    // Finally
    // ------------------------------------------------------
    return new TesterService();
});
