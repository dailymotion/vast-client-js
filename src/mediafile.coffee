class VASTMediaFile
    constructor: ->
        @id = null
        @fileURL = null
        @deliveryType = "progressive"
        @mimeType = null
        @codec = null
        @bitrate = 0
        @minBitrate = 0
        @maxBitrate = 0
        @width = 0
        @height = 0
        @apiFramework = null
        @scalable = null
        @maintainAspectRatio = null

module.exports = VASTMediaFile
