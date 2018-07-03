import l from 'lodash'
import t from '../../lib/i18n-translate.js'
import cx from 'classnames/dedupe'
import async from 'async'
import url from 'url'
import xhr from 'xhr'
import getRailsCSRFToken from '../../lib/rails-csrf-token.coffee'
import BoxBatchTextInput from './BoxBatchTextInput.js'
import BoxBatchDateInput from './BoxBatchDateInput.js'
import BoxBatchLoadMetaMetaData from './BoxBatchLoadMetaMetaData.js'


module.exports = ({event, trigger, initial, components, data}) => {

  var cachedAllMetaKeysById = null

  var next = () => {

    if(initial) {
      return {
        data: {
          open: false
        },
        components: {
          loadMetaMetaData: nextLoadMetaMetaData(),
          metaKeyForms: []
        }
      }
    } else {
      return {
        data: {
          open: nextOpen()
        },
        components: {
          loadMetaMetaData: nextLoadMetaMetaData(),
          metaKeyForms: nextMetaKeyForms()
        }
      }
    }

  }


  var nextLoadMetaMetaData = () => {
    return {
      reset: false,
      reduce: BoxBatchLoadMetaMetaData,
      props: {
        mount: event.action == 'mount'
      }
    }
  }

  var nextMetaKeyForms = () => {

    var findMetaKeyForm = (metaKeyId) => {
      return l.find(components.metaKeyForms, (f) => f.props.metaKeyId == event.metaKeyId)
    }


    var findMetaKey = (metaKeyId) => {

      if(!cachedAllMetaKeysById) {
        cachedAllMetaKeysById = l.fromPairs(
          l.flatten(
            l.map(
              components.loadMetaMetaData.data.metaMetaData,
              (mmd) => l.map(
                mmd.data.meta_key_by_meta_key_id,
                (m, k) => [k, m]
              )
            )
          )
        )
      }

      return cachedAllMetaKeysById[metaKeyId]
    }

    var withoutClosed = () => {
      return l.filter(
        components.metaKeyForms,
        (f) => f.event.action != 'close'
      )
    }

    var createBoxBatchEdit = (metaKeyId) => {
      return {
        reset: false,
        reduce: decideReduce(metaKeyId),
        props: {
          metaKeyId: metaKeyId,
          metaKey: findMetaKey(metaKeyId)
        }
      }
    }

    var mapExisting = () => {
      return l.map(
        withoutClosed(),
        (c) => createBoxBatchEdit(c.props.metaKeyId)
      )
    }

    var decideReduce = (metaKeyId) => {
      var mapping = {
        'MetaDatum::Text': BoxBatchTextInput,
        'MetaDatum::TextDate': BoxBatchDateInput
      }
      var type = findMetaKey(metaKeyId).value_type
      if(!mapping[type]) throw 'not implemented for ' + type
      return mapping[type]
    }

    if(event.action == 'select-key' && !findMetaKeyForm(event.metaKeyId)) {
      return l.concat(
        mapExisting(),
        createBoxBatchEdit(event.metaKeyId)
      )
    } else {
      return mapExisting()
    }
  }

  var nextOpen = () => {

    var ready = () => {
      return components.loadMetaMetaData.data.metaKeysWithTypes
    }

    if(event.action == 'toggle') {
      if(ready() && !data.open) {
        return true
      } else {
        return false
      }
    } else {
      return data.open
    }
  }

  return next()
}
