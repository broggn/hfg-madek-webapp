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
          metaMetaData: [],
          metaKeysWithTypes: null
        },
        components: {}
      }
    } else {
      return {
        data: {
          metaMetaData: nextData(),
          metaKeysWithTypes: nextMetaKeysWithTypes()
        },
        components: {}
      }
    }
  }

  var nextMetaKeysWithTypes = () => {
    if(event.action == 'data-loaded' && nextData().length == 2) {


      var metaKeysWithTypes = (metaMetaData) => {

        var allMetaKeyIds = () => {
          return l.uniq(l.flatten(l.map(
            metaMetaData,
            (mmd) => l.keys(mmd.data.meta_key_by_meta_key_id)
          )))

        }

        var allMetaKeysById = () => {
          return l.reduce(
            metaMetaData,
            (memo, mmd) => {
              return l.merge(
                memo,
                mmd.data.meta_key_by_meta_key_id
              )
            },
            {}
          )
        }

        return l.map(
          allMetaKeyIds(),
          (k) => {
            return {
              metaKeyId: k,
              types: l.map(
                l.filter(
                  metaMetaData,
                  (mmd) => {
                    return l.has(mmd.data.meta_key_by_meta_key_id, k)
                  }
                ),
                (m) => m.type
              ),
              metaKey: allMetaKeysById()[k]
            }
          }
        )
      }

      return metaKeysWithTypes(nextData())

    } else {
      return data.metaKeysWithTypes
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