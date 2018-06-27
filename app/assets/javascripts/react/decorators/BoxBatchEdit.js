import l from 'lodash'
import t from '../../lib/i18n-translate.js'
import cx from 'classnames/dedupe'
import async from 'async'
import url from 'url'
import xhr from 'xhr'
import getRailsCSRFToken from '../../lib/rails-csrf-token.coffee'


module.exports = (last, props, trigger) => {

  var next = () => {

    if(props.event == 'mount') {
      asyncLoadData('MediaEntry')
      asyncLoadData('Collection')
    }

    if(!last) {
      return {
        metaMetaData: [],
        open: false
      }
    } else {
      return {
        metaMetaData: nextData(),
        open: nextOpen()
      }
    }
  }

  var nextOpen = () => {

    var ready = () => {
      return last.metaMetaData.length == 2
    }

    if(props.event == 'toggle') {
      if(ready() && !last.open) {
        return true
      } else {
        return false
      }
    } else {
      return last.open
    }
  }

  var nextData = () => {
    if(props.event == 'data-loaded') {
      return last.metaMetaData.concat({
        data: props.data,
        type: props.type
      })
    } else {
      return last.metaMetaData
    }
  }

  var asyncLoadData = (type) => {
    var url = '/meta_meta_data?type=' + type
    xhr(
      {
        url: url,
        method: 'GET',
        json: true,
        headers: {
          'Accept': 'application/json',
          'X-CSRF-Token': getRailsCSRFToken()
        }
      },
      (err, res, json) => {
        if(err) {
          return
        } else {
          trigger({
            event: 'data-loaded',
            type: type,
            data: json
          })
        }
      }
    )
  }

  return next()
}
