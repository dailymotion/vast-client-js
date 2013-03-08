class VASTMediaFile
    constructor: ->
        @fileURL = null
        @deliveryType = "progressive"
        @mimeType = null
        @codec = null
        @bitrate = 0
        @minBitrate = 0
        @maxBitrate = 0
        @width = 0
        @height = 0

module.exports = VASTMediaFile
