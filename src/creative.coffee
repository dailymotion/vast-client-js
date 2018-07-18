class VASTCreative
    constructor: (creativeAttributes = {}) ->
        @id = creativeAttributes.id or null
        @adId = creativeAttributes.adId or null
        @sequence = creativeAttributes.sequence or null
        @apiFramework = creativeAttributes.apiFramework or null
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
        super
        @type = "companion"
        @variations = []

module.exports =
    VASTCreativeLinear: VASTCreativeLinear
    VASTCreativeNonLinear: VASTCreativeNonLinear
    VASTCreativeCompanion: VASTCreativeCompanion
