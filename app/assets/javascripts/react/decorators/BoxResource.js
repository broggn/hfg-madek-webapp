import l from 'lodash'
import t from '../../lib/i18n-translate.js'
import cx from 'classnames/dedupe'
import async from 'async'
import xhr from 'xhr'
import getRailsCSRFToken from '../../lib/rails-csrf-token.coffee'
import BoxBatchEdit from './BoxBatchEdit.js'
import setUrlParams from '../../lib/set-params-for-url.coffee'

import url from 'url'
import qs from 'qs'

var parseUrl = url.parse
var buildUrl = url.format
var buildQuery = qs.stringify
var parseQuery = qs.parse


module.exports = ({event, trigger, initial, components, data, nextProps}) => {

  var next = () => {

    // if(event.action == 'apply') {
    //   debugger
    //   // applyMetaData(event.uuid, event.type, nextProps.formData)
    // }

    if(nextProps.loadMetaData || event.action == 'load-meta-data-failure') {
      loadMetaData()
    }

    if(event.action == 'apply-success') {
      reloadResource()
    }

    if(initial) {
      return {
        data: {
          resource: nextProps.resource,
          listMetaData: null,
          loadingListMetaData: false,
          applyingMetaData: false
        },
        components: {
        }
      }
    } else {
      return {
        data: {
          resource: nextResource(),
          listMetaData: nextListMetaData(),
          loadingListMetaData: nextLoadingListMetaData(),
          applyingMetaData: nextApplyingMetaData()
        },
        components: {
        }
      }
    }
  }

  var nextApplyingMetaData = () => {
    if(event.action == 'apply') {
      return true
    } else if(event.action == 'reload-success') {
      return false
    } else {
      return data.applyingMetaData
    }


  }

  var nextLoadingListMetaData = () => {
    if(nextProps.loadMetaData) {
      return true
    } else if(event.action == 'load-meta-data-success') {
      return false
    } else {
      return data.loadingListMetaData
    }
  }

  var nextListMetaData = () => {
    if(event.action == 'load-meta-data-success') {
      return event.json
    } else {
      return data.listMetaData
    }
  }

  var nextResource = () => {
    if(event.action == 'reload-success') {
      return event.json
    } else {
      return data.resource
    }
  }

  var loadMetaData = () => {

    var currentQuery = parseQuery(
      parseUrl(window.location.toString()).query
    )

    var parsedUrl = parseUrl(data.resource.list_meta_data_url, true)
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
          trigger({action: 'load-meta-data-failure'})
        } else {
          trigger({action: 'load-meta-data-success', json: json})
        }
      }
    )

  }


  var reloadResource = () => {

    xhr.get(
      {
        url: nextProps.resource.url,
        json: true
      },
      (err, res, json) => {
        if(err || res.statusCode > 400) {
          // trigger({action: 'load-meta-data-failure'})
        } else {
          trigger({action: 'reload-success', json: json})
        }
      }
    )
  }



  return next()
}
