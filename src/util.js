storage = null

class VASTUtil
    constructor: ->
        @storage = @initStorage()

    initStorage: ->
        if storage?
            return storage

        try
            storage = if window? then window.localStorage or window.sessionStorage else null
        catch storageError
            storage = null

        # In Safari (Mac + iOS) when private browsing is ON,
        # localStorage is read only
        # http://spin.atomicobject.com/2013/01/23/ios-private-browsing-localstorage/
        isDisabled = (store) ->
            try
                testValue = '__VASTUtil__'
                store.setItem testValue, testValue
                return yes if store.getItem(testValue) isnt testValue
            catch e
                return yes
            return no


        if not storage? or isDisabled(storage)
            data = {}
            storage = {
                length: 0
                getItem: (key) ->
                    return data[key]
                setItem: (key, value) ->
                    data[key] = value
                    @length = Object.keys(data).length
                    return
                removeItem: (key) ->
                    delete data[key]
                    @length = Object.keys(data).length
                    return
                clear: () ->
                    data = {}
                    @length = 0
                    return
            }

        return storage

    getStorage: ->
        return @storage

    track: (URLTemplates, variables) ->
        URLs = @resolveURLTemplates(URLTemplates, variables)
        for URL in URLs
            if window?
                i = new Image()
                i.src = URL
            else
                # node mode, do not track (unit test only)

    resolveURLTemplates: (URLTemplates, variables = {}) ->
        URLs = []

        # Encode String variables, when given
        variables["ASSETURI"]        = @encodeURIComponentRFC3986(variables["ASSETURI"]) if variables["ASSETURI"]?
        variables["CONTENTPLAYHEAD"] = @encodeURIComponentRFC3986(variables["CONTENTPLAYHEAD"]) if variables["CONTENTPLAYHEAD"]?

        # Set default value for invalid ERRORCODE
        variables["ERRORCODE"] = 900 if variables["ERRORCODE"]? and not /^[0-9]{3}$/.test(variables["ERRORCODE"])

        # Calc random/time based macros
        variables["CACHEBUSTING"] = @leftpad(Math.round(Math.random() * 1.0e+8).toString())
        variables["TIMESTAMP"]    = @encodeURIComponentRFC3986((new Date).toISOString())

        # RANDOM/random is not defined in VAST 3/4 as a valid macro tho it's used by some adServer (Auditude)
        variables["RANDOM"] = variables["random"] = variables["CACHEBUSTING"]

        for URLTemplate in URLTemplates
            resolveURL = URLTemplate
            continue unless resolveURL
            for key, value of variables
                macro1 = "[#{key}]"
                macro2 = "%%#{key}%%"
                resolveURL = resolveURL.replace(macro1, value)
                resolveURL = resolveURL.replace(macro2, value)
            URLs.push resolveURL

        return URLs

    # https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
    encodeURIComponentRFC3986: (str) ->
        return encodeURIComponent(str).replace(/[!'()*]/g, (c) ->
            return '%' + c.charCodeAt(0).toString(16)
        )

    leftpad: (str) ->
        return if str.length < 8 then ('0' for [0...8-str.length]).join('') + str else str

    # https://gist.github.com/sheldonh/6089299
    merge: (xs...) ->
        if xs?.length > 0
            @tap {}, (m) -> m[k] = v for k, v of x for x in xs

    tap: (o, fn) -> fn(o); o

    isNumeric: (n) ->
        return !isNaN(parseFloat(n)) and isFinite(n)

module.exports = VASTUtil
