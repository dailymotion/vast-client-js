class VASTUtil
    @track: (URLTemplates, variables) ->
        URLs = @resolveURLTemplates(URLTemplates, variables)
        for URL in URLs
            if window?
                i = new Image()
                i.src = URL
            else
                # node mode, do not track (unit test only)

    @resolveURLTemplates: (URLTemplates, variables) ->
        URLs = []

        variables ?= {} # ["CACHEBUSTING", "random", "CONTENTPLAYHEAD", "ASSETURI", "ERRORCODE"]
        unless "CACHEBUSTING" of variables
            variables["CACHEBUSTING"] = Math.round(Math.random() * 1.0e+10)
        variables["random"] = variables["CACHEBUSTING"] # synonym for Auditude macro

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

    @storage: do () ->
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


module.exports = VASTUtil
