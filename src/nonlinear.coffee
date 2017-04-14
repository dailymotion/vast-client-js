class VASTNonLinear
    constructor: ->
        @id = null
        @width = 0
        @height = 0
        @expandedWidth = 0
        @expandedHeight = 0
        @scalable = true
        @maintainAspectRatio = true
        @minSuggestedDuration = 0
        @apiFramework = "static"
        @type = null
        @staticResource = null
        @htmlResource = null
        @iframeResource = null
        @nonlinearClickThroughURLTemplate = null
        @nonlinearClickTrackingURLTemplates = []
        @adParameters = null

module.exports = VASTNonLinear
