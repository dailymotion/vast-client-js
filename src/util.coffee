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

module.exports = VASTUtil

if window?
    window.VASTUtil = VASTUtil