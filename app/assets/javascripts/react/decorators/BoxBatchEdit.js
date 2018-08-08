import l from 'lodash'
import t from '../../lib/i18n-translate.js'
import cx from 'classnames/dedupe'
import async from 'async'
import url from 'url'
import xhr from 'xhr'
import getRailsCSRFToken from '../../lib/rails-csrf-token.coffee'
import BoxBatchTextInput from './BoxBatchTextInput.js'
import BoxBatchDateInput from './BoxBatchDateInput.js'
import BoxBatchKeywords from './BoxBatchKeywords.js'
import BoxBatchPeople from './BoxBatchPeople.js'
import BoxBatchLoadMetaMetaData from './BoxBatchLoadMetaMetaData.js'


module.exports = (merged) => {

  let {event, trigger, initial, components, data, nextProps} = merged

  var cachedAllMetaKeysById = null

  var next = () => {

    if(nextProps.copy) {
      xhr.get(
        {
          url: nextProps.copy.url,
          json: true
        },
        (err, res, body) => {
          var md = l.flatten(
            l.map(
              body.meta_data.by_vocabulary,
              (v) => v.meta_data
            )
          )

          trigger(merged, {
            action: 'copy-loaded',
            metaData: md
          })
        }
      )
    }

    if(initial) {
      return {
        data: {
          open: false,
          copying: false,
          invalidMetaKeyUuids: nextInvalidMetaKeyUuids()
        },
        components: {
          loadMetaMetaData: nextLoadMetaMetaData(),
          metaKeyForms: []
        }
      }
    } else {
      return {
        data: {
          open: nextOpen(),
          copying: nextCopying(),
          invalidMetaKeyUuids: nextInvalidMetaKeyUuids()
        },
        components: {
          loadMetaMetaData: nextLoadMetaMetaData(),
          metaKeyForms: nextMetaKeyForms()
        }
      }
    }

  }

  var nextCopying = () => {
    if(nextProps.copy) {
      return true
    } else if(event.action == 'copy-loaded') {
      return false
    } else {
      return data.copying
    }
  }

  var nextInvalidMetaKeyUuids = () => {
    if(initial) {
      return []
    }
    else if(nextProps.invalidMetaKeyUuids) {
      return nextProps.invalidMetaKeyUuids
    } else {
      return data.invalidMetaKeyUuids
    }
  }


  var nextLoadMetaMetaData = () => {
    return {
      reset: false,
      reduce: BoxBatchLoadMetaMetaData,
      props: {
        mount: nextProps.mount
      }
    }
  }

  var nextMetaKeyForms = () => {

    var findMetaKeyForm = (metaKeyId) => {
      return l.find(components.metaKeyForms, (f) => f.props.metaKeyId == event.metaKeyId)
    }

    var allMetaKeysById = () => {
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
      return cachedAllMetaKeysById
    }

    var mandatoryForTypes = (metaKeyId) => {

      return l.map(
        l.filter(
          components.loadMetaMetaData.data.metaMetaData,
          (mmd) => l.includes(l.keys(mmd.data.mandatory_by_meta_key_id), metaKeyId)
        ),
        (mmd) => mmd.type
      )
    }


    var findMetaKey = (metaKeyId) => {
      return allMetaKeysById()[metaKeyId]
    }

    var withoutClosed = () => {
      return l.filter(
        components.metaKeyForms,
        (f) => f.event.action != 'close'
      )
    }

    var createBoxBatchEdit = (componentId, metaKeyId) => {
      return {
        reuseId: componentId,
        reset: false,
        reduce: decideReduce(metaKeyId),
        props: {
          metaKeyId: metaKeyId,
          metaKey: findMetaKey(metaKeyId),
          mandatoryForTypes: mandatoryForTypes(metaKeyId),
          invalid: l.includes(nextInvalidMetaKeyUuids(), metaKeyId)
        }
      }
    }

    var mapExisting = () => {
      return l.map(
        withoutClosed(),
        (c) => createBoxBatchEdit(c.id, c.props.metaKeyId)
      )
    }

    var decideReduce = (metaKeyId) => {
      var mapping = {
        'MetaDatum::Text': BoxBatchTextInput,
        'MetaDatum::TextDate': BoxBatchTextInput,
        'MetaDatum::Keywords': BoxBatchKeywords,
        'MetaDatum::People': BoxBatchPeople
      }
      var type = findMetaKey(metaKeyId).value_type
      if(!mapping[type]) throw 'not implemented for ' + type
      return mapping[type]
    }

    if(nextProps.copy) {
      return []
    }
    else if(event.action == 'copy-loaded') {
      return l.map(
        event.metaData,
        (md) => {
          var metaKeyId = md.meta_key_id
          return {
            reuseId: null,
            reset: false,
            reduce: decideReduce(metaKeyId),
            props: {
              metaKeyId: metaKeyId,
              metaKey: findMetaKey(metaKeyId),
              mandatoryForTypes: mandatoryForTypes(metaKeyId),
              invalid: l.includes(nextInvalidMetaKeyUuids(), metaKeyId),
              values: md.values
            }
          }
        }
      )

    }
    else if(event.action == 'select-key' && !findMetaKeyForm(event.metaKeyId)) {
      return l.concat(
        mapExisting(),
        createBoxBatchEdit(null, event.metaKeyId)
      )
    } else {
      return mapExisting()
    }
  }

  var nextOpen = () => {

    var ready = () => {
      return true
      // return components.loadMetaMetaData.data.metaKeysWithTypes
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
