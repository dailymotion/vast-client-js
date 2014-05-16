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

class VASTCreativeNonLinear extends VASTCreative
    # TODO

class VASTCreativeCompanion
    constructor: ->
        @type = "companion"
        @variations = []
        @trackingEvents = {}
        @videoClickTrackingURLTemplates = []

module.exports =
    VASTCreativeLinear: VASTCreativeLinear
    VASTCreativeNonLinear: VASTCreativeNonLinear
    VASTCreativeCompanion: VASTCreativeCompanion
