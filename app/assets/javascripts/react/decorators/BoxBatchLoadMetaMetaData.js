import l from 'lodash'
import t from '../../lib/i18n-translate.js'
import cx from 'classnames/dedupe'
import async from 'async'
import url from 'url'
import xhr from 'xhr'
import getRailsCSRFToken from '../../lib/rails-csrf-token.coffee'
import BoxBatchTextInput from './BoxBatchTextInput.js'
import BoxBatchDateInput from './BoxBatchDateInput.js'


module.exports = ({event, trigger, initial, components, data, nextProps}) => {

  var next = () => {

    if(nextProps.mount) {
      asyncLoadData('MediaEntry')
      asyncLoadData('Collection')
    }

    if(initial) {
      return {
        data: {
          metaMetaData: []
        },
        components: {}
      }
    } else {
      return {
        data: {
          metaMetaData: nextData()
        },
        components: {}
      }
    }
  }

  var nextData = () => {
    if(event.action == 'data-loaded') {
      return data.metaMetaData.concat({
        data: event.data,
        type: event.type
      })
    } else {
      return data.metaMetaData
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
          debugger
          trigger({
            action: 'data-loaded',
            type: type,
            data: json
          })
        }
      }
    )
  }

  return next()
}
