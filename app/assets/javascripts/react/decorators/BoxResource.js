import l from 'lodash'
import t from '../../lib/i18n-translate.js'
import cx from 'classnames/dedupe'
import async from 'async'
import xhr from 'xhr'
import getRailsCSRFToken from '../../lib/rails-csrf-token.coffee'
import BoxBatchEdit from './BoxBatchEdit.js'
import BoxResourceBatch from './BoxResourceBatch.js'
import BoxRedux from './BoxRedux.js'
import setUrlParams from '../../lib/set-params-for-url.coffee'

import url from 'url'
import qs from 'qs'

var parseUrl = url.parse
var buildUrl = url.format
var buildQuery = qs.stringify
var parseQuery = qs.parse


module.exports = (merged) => {

  let {event, trigger, initial, components, data, nextProps, path} = merged

  var next = () => {

    if(nextProps.loadMetaData) {
      loadMetaData()
    }

    if(initial) {
      return {
        data: {
          resource: nextProps.resource,
          listMetaData: (nextProps.resource.list_meta_data ? nextProps.resource.list_meta_data : null),
          loadingListMetaData: nextProps.loadMetaData
        },
        components: {
          resourceBatch: nextResourceBatch()
        }
      }
    } else {
      return {
        data: {
          resource: nextResource(),
          listMetaData: nextListMetaData(),
          loadingListMetaData: nextLoadingListMetaData()
        },
        components: {
          resourceBatch: nextResourceBatch()
        }
      }
    }
  }

  var nextResourceBatch = () => {

    var r = BoxResourceBatch(
      {
        event: (initial ? {} : components.resourceBatch.event),
        trigger: trigger,
        initial: initial,
        components: (initial ? {} : components.resourceBatch.components),
        data: (initial ? {} : components.resourceBatch.data),
        nextProps: nextProps,
        path: l.concat(path, ['resourceBatch'])
      }
    )
    r.props = nextProps
    r.id = (initial ? BoxRedux.nextId() : components.resourceBatch.id)
    r.path = l.concat(path, ['resourceBatch'])
    return r
  }








  var nextLoadingListMetaData = () => {
    if(nextProps.loadMetaData) {
      return true
    } else if(event.action == 'load-meta-data-success' || event.action == 'load-meta-data-failure') {
      return false
    } else {
      return data.loadingListMetaData
    }
  }

  var nextListMetaData = () => {
    if(nextProps.waitApply || nextProps.startApply) {
      return null
    } else if(event.action == 'load-meta-data-success') {
      return event.json
    } else {
      return data.listMetaData
    }
  }

  var nextResource = () => {
    return data.resource
  }


  var sharedLoadMetaData = ({success, error}) => {
    var currentQuery = parseQuery(
      parseUrl(window.location.toString()).query
    )


    var getResourceUrl = () => {
      if(initial) {
        return nextProps.resource.list_meta_data_url
      } else {
        return data.resource.list_meta_data_url
      }
    }

    var parsedUrl = parseUrl(getResourceUrl(), true)
    delete parsedUrl.search

    var url = setUrlParams(
      buildUrl(parsedUrl),
      currentQuery
    )

    xhr.get(
      {
        url: url,
        json: true
      },
      (err, res, json) => {
        if(err || res.statusCode > 400) {
          setTimeout(
            () => error(),
            1000
          )
        } else {
          success(json)
        }
      }
    )

  }

  var loadMetaData = () => {
    sharedLoadMetaData({
      success: (json) => {
        trigger(merged, {action: 'load-meta-data-success', json: json})
      },
      error: () => trigger(merged, {action: 'load-meta-data-failure'})
    })
  }


  return next()
}
