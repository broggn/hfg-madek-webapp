f = require('active-lodash')
parseUrl = require('url').parse
stringifyUrl = require('url').format
parseQuery = require('qs').parse

setUrlParams = require('./set-params-for-url.coffee')


replaceWithSet = (currentUrl, currentType, newType) ->
  currentType
  setUrlParams(
    currentUrl.pathname.replace(RegExp("\/#{currentType}$"), "\/#{newType}"),
    f.omit(currentParams, 'list'), {list: listParams})


module.exports = (url, config) ->


  # The fallback url is used for search results if there are no
  # entries found but potentially sets.
  # If we are on a box which toggles between /entries and /sets,
  # we simply replace /entries with /sets.
  # Otherwise we use type='collections' as url parameter.
  # The whole thing however only works, when we have no filters
  # other than search, because the filters for sets are not yet
  # implemented. In this case we simply return nothing.

  currentType = 'entries'
  type = 'sets'

  currentUrl = parseUrl(url)
  currentParams = parseQuery(currentUrl.query)

  # If we have filters other than search we do not use the fallback.
  if currentParams.list and currentParams.list.filter
    filter = JSON.parse(currentParams.list.filter)
    return if f.size(filter) > 1
    searchTerm = filter.search
    return if f.size(filter) == 1 && not searchTerm

  # HACK: build link to 'sets', but remove filter (only 'search' is implemented!)
  resetlistParams = { page: 1, accordion: null }
  listParams = f.assign(currentParams.list, resetlistParams)
  if searchTerm
    listParams = f.assign(listParams, { filter: JSON.stringify({search: searchTerm}) })


  if f.startsWith(currentUrl.pathname, '/vocabulary/keyword')
    setUrlParams(
      parseUrl(url),
      f.omit(currentParams, 'list'),
      {list: listParams},
      {type: 'collections'}
    )
  else
    setUrlParams(
      currentUrl.pathname.replace(RegExp("\/#{currentType}$"), "\/#{type}"),
      f.omit(currentParams, 'list'),
      {list: listParams}
    )