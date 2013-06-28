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

        variables ?= {}
        unless "CACHEBUSTING" of variables
            variables["CACHEBUSTING"] = Math.round(Math.random() * 1.0e+10)
        variables["random"] = variables["CACHEBUSTING"] # synonym for Auditude macro

        for URLTemplate in URLTemplates
            resolveURL = URLTemplate
            for name in ["CACHEBUSTING", "random", "CONTENTPLAYHEAD", "ASSETURI", "ERRORCODE"]
                macro = "[#{name}]"
                value = variables[name]
                resolveURL = resolveURL.replace(macro, value)
            URLs.push resolveURL

        return URLs

    @storage: do () ->
        storage = if window? then window.localStorage or window.sessionStorage else null

        if not storage?
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
