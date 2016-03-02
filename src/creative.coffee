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

class VASTCreativeNonLinear extends VASTCreative
    constructor: ->
        super
        @type = "nonlinear"
        @variations = []
        @videoClickTrackingURLTemplates = []

class VASTCreativeCompanion extends VASTCreative
    constructor: ->
        @type = "companion"
        @variations = []
        @videoClickTrackingURLTemplates = []

module.exports =
    VASTCreativeLinear: VASTCreativeLinear
    VASTCreativeNonLinear: VASTCreativeNonLinear
    VASTCreativeCompanion: VASTCreativeCompanion
