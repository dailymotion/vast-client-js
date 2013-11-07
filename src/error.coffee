class VASTError
    constructor: (@message = '', @response = null, @stack = []) ->
        @time = +new Date()

module.exports = VASTError