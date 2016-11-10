class VASTCreative
    constructor: ->
        @trackingEvents = {}

class VASTCreativeLinear extends VASTCreative
    constructor: ->
        super
        @type = "linear"
        @duration = 0
        @skipDelay = null
        @mediaFiles = []
        @videoClickThroughURLTemplate = null
        @videoClickTrackingURLTemplates = []
        @videoCustomClickURLTemplates = []
        @adParameters = null
        @icons = []

class VASTCreativeNonLinear extends VASTCreative
    constructor: ->
        super
        @type = "nonlinear"
        @variations = []

class VASTCreativeCompanion extends VASTCreative
    constructor: ->
        @type = "companion"
        @variations = []

module.exports =
    VASTCreativeLinear: VASTCreativeLinear
    VASTCreativeNonLinear: VASTCreativeNonLinear
    VASTCreativeCompanion: VASTCreativeCompanion
