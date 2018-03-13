VASTUtil = require '../util.coffee'

class ParserUtils
    constructor: ->
        @vastUtil = new VASTUtil()

    childByName: (node, name) ->
        for child in node.childNodes
            if child.nodeName is name
                return child

    childrenByName: (node, name) ->
        children = []
        for child in node.childNodes
            if child.nodeName is name
                children.push child
        return children

    parseBoolean: (booleanString) ->
        return booleanString in ['true', 'TRUE', '1']

    # Parsing node text for legacy support
    parseNodeText: (node) ->
        return node and (node.textContent or node.text or '').trim()

    copyNodeAttribute: (attributeName, nodeSource, nodeDestination) ->
        attributeValue = nodeSource.getAttribute attributeName
        if attributeValue
            nodeDestination.setAttribute attributeName, attributeValue

    parseDuration: (durationString) ->
        unless (durationString?)
            return -1
        # Some VAST doesn't have an HH:MM:SS duration format but instead jus the number of seconds
        if @vastUtil.isNumeric(durationString)
            return parseInt durationString

        durationComponents = durationString.split(":")
        if durationComponents.length != 3
            return -1

        secondsAndMS = durationComponents[2].split(".")
        seconds = parseInt secondsAndMS[0]
        if secondsAndMS.length == 2
            seconds += parseFloat "0." + secondsAndMS[1]

        minutes = parseInt durationComponents[1] * 60
        hours = parseInt durationComponents[0] * 60 * 60

        if isNaN(hours) or isNaN(minutes) or isNaN(seconds) or minutes > 60 * 60 or seconds > 60
            return -1
        return hours + minutes + seconds

module.exports = ParserUtils
