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


module.exports = (merged) => {

  let {event, trigger, initial, components, data, nextProps} = merged

  var next = () => {

    if(nextProps.loadMetaData) {// || event.action == 'load-meta-data-failure') {
      loadMetaData()
    }

    // if(event.action == 'apply-success' || event.action == 'apply-error') {
    //   // reloadResource()
    // }

    // if(event.action == 'reload-success') {
    //   reloadMetaData()
    // }

    if(initial) {
      return {
        data: {
          resource: nextProps.resource,
          thumbnailMetaData: null,
          listMetaData: (nextProps.resource.list_meta_data ? nextProps.resource.list_meta_data : null),
          loadingListMetaData: false,
          applyPending: false,
          applyingMetaData: false,
          applyDone: false,
          applyCancelled: false,
          applyError: false
        },
        components: {
        }
      }
    } else {
      return {
        data: {
          resource: nextResource(),
          thumbnailMetaData: nextThumbnailMetaData(),
          listMetaData: nextListMetaData(),
          loadingListMetaData: nextLoadingListMetaData(),
          applyPending: nextApplyPending(),
          applyingMetaData: nextApplyingMetaData(),
          applyDone: nextApplyDone(),
          applyCancelled: nextApplyCancelled(),
          applyError: nextApplyError()
        },
        components: {
        }
      }
    }
  }

  var nextThumbnailMetaData = () => {
    if(event.action == 'apply-success') {
      var getTitle = () => {
        if(event.thumbnailMetaData.title) {
          return event.thumbnailMetaData.title
        } else if(data.thumbnailMetaData) {
          return data.thumbnailMetaData.title
        } else {
          return null
        }
      }
      var getAuthors = () => {
        if(event.thumbnailMetaData.authors) {
          return event.thumbnailMetaData.authors
        } else if(data.thumbnailMetaData) {
          return data.thumbnailMetaData.authors
        } else {
          return null
        }
      }
      return {
        title: getTitle(),
        authors: getAuthors()
      }

    } else {
      return data.thumbnailMetaData
    }
  }

  var nextApplyError = () => {
    if(event.action == 'apply-error') {
      return true
    } else if(nextProps.waitApply || nextProps.startApply || nextProps.resetStatus) {
      return false
    } else {
      return data.applyError
    }
  }

  var nextApplyCancelled = () => {
    if(nextProps.cancelApply && data.applyPending) {
      return true
    } else if(nextProps.resetStatus) {
      return false
    } else {
      return data.applyCancelled
    }
  }

  var nextApplyDone = () => {
    if(nextProps.waitApply || nextProps.resetStatus) {
      return false
    } else if(event.action == 'apply-success') {
      return true
    } else {
      return data.applyDone
    }
  }

  var nextApplyPending = () => {
    if(nextProps.waitApply) {
      return true
    } else if(nextProps.startApply/*event.action == 'apply-success'*/ || nextProps.cancelApply) {
      return false
    } else {
      return data.applyPending
    }
  }

  var nextApplyingMetaData = () => {
    if(nextProps.startApply) {
      return true
    }
    else if(event.action == 'apply-success') {
      return false
    } else {
      return data.applyingMetaData
    }


  }

  var nextLoadingListMetaData = () => {
    if(nextProps.loadMetaData/* || nextProps.waitApply*/) {
      return true
    } else if(event.action == 'load-meta-data-success' || event.action == 'load-meta-data-failure') {// || event.action == 'reload-meta-data-success') {
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
    // } else if(event.action == 'reload-meta-data-success') {
    //   return event.json
    } else {
      return data.listMetaData
    }
  }

  var nextResource = () => {
    // if(event.action == 'reload-success') {
    //   // NOTE: Better give json back directly. But the reload answer does for
    //   // example not contain list_meta_data_url. Thats why we merge here.
    //   return l.merge(
    //     data.resource,
    //     event.json
    //   )
    // } else {
    return data.resource
    // }
  }


  var sharedLoadMetaData = ({success, error}) => {
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
          error()
        } else {
          success(json)
        }
      }
    )

  }

  // var reloadMetaData = () => {
  //   sharedLoadMetaData({
  //     success: (json) => trigger(merged, {action: 'reload-meta-data-success', json: json}),
  //     error: () => trigger(merged, {action: 'reload-meta-data-failure'})
  //   })
  // }

  var loadMetaData = () => {
    sharedLoadMetaData({
      success: (json) => trigger(merged, {action: 'load-meta-data-success', json: json}),
      error: () => trigger(merged, {action: 'load-meta-data-failure'})
    })
  }


  // var reloadResource = () => {
  //
  //   xhr.get(
  //     {
  //       url: nextProps.resource.url,
  //       json: true
  //     },
  //     (err, res, json) => {
  //       if(err || res.statusCode > 400) {
  //         // trigger({action: 'load-meta-data-failure'})
  //       } else {
  //         trigger(merged, {action: 'reload-success', json: json})
  //       }
  //     }
  //   )
  // }



  return next()
}
