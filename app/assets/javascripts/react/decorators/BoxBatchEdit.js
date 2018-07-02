import l from 'lodash'
import t from '../../lib/i18n-translate.js'
import cx from 'classnames/dedupe'
import async from 'async'
import url from 'url'
import xhr from 'xhr'
import getRailsCSRFToken from '../../lib/rails-csrf-token.coffee'
import BoxBatchTextInput from './BoxBatchTextInput.js'
import BoxBatchDateInput from './BoxBatchDateInput.js'


module.exports = (component, trigger, merged) => {

  if(!merged) {
    return {
      data: {
        metaMetaData: [],
        open: false
      },
      components: {
        metaKeyForms: []
      }
    }
  }


  // var last = component.last
  var event = merged.event
  // var props = component.props

  var cachedAllMetaKeysById = null

  var next = () => {

    if(event.event == 'mount') {
      asyncLoadData('MediaEntry')
      asyncLoadData('Collection')
    }


    return {
      data: {
        metaMetaData: nextData(),
        open: nextOpen()
      },
      components: {
        metaKeyForms: nextMetaKeyForms()
      }
    }
  }


  var nextMetaKeyForms = () => {

    var findMetaKeyForm = (metaKeyId) => {
      return l.find(merged.components.metaKeyForms, (f) => f.props.metaKeyId == event.metaKeyId)
    }


    var findMetaKey = (metaKeyId) => {

      if(!cachedAllMetaKeysById) {
        cachedAllMetaKeysById = l.fromPairs(
          l.flatten(
            l.map(
              merged.data.metaMetaData,
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

    // var createText = () => {
    //   return {
    //     value: ''
    //   }
    // }
    //
    // var createForm = (metaKey) => {
    //   var formCreators = {
    //     'MetaDatum::Text': () => createText()
    //   }
    //   var creator = formCreators[metaKey.value_type]
    //   if(!creator) throw 'not implemented for ' + metaKey.vlaue_type
    //   return creator()
    // }
    //
    // var createMetaKeyForm = (metaKeyId) => {
    //   var metaKey = findMetaKey(metaKeyId)
    //   return {
    //     metaKeyId: metaKeyId,
    //     metaKey: metaKey,
    //     form: createForm(metaKey)
    //   }
    // }
    //
    // if(props.event.event == 'select-key') {
    //   if(!findMetaKeyForm(props.event.metaKeyId)) {
    //     return l.concat(
    //       last.data.metaKeyForms,
    //       createMetaKeyForm(props.event.metaKeyId)
    //     )
    //   } else {
    //     return last.data.metaKeyForms
    //   }
    // } else {
    //   return last.data.metaKeyForms
    // }

    var withoutClosed = () => {
      return l.filter(
        merged.components.metaKeyForms,
        (f) => {
          return f.event.event != 'close'
        }
      )
    }

    var mapExisting = () => {
      debugger
      return l.map(
        withoutClosed(),
        (c) => {
          return {
            reset: false,
            reduce: decideReduce(c.props.metaKeyId),
            props: {
              metaKeyId: c.props.metaKeyId,
              metaKey: findMetaKey(c.props.metaKeyId)
            }
          }
        }
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


    if(event.event == 'select-key') {
      if(!findMetaKeyForm(event.metaKeyId)) {
        return l.concat(
          mapExisting(),
          {
            reset: false,
            reduce: decideReduce(event.metaKeyId),
            props: {
              metaKeyId: event.metaKeyId,
              metaKey: findMetaKey(event.metaKeyId)
            }
          }
        )
      } else {
        return mapExisting()
      }
    } else {
      return mapExisting()
    }

  }

  var nextOpen = () => {

    var ready = () => {
      return merged.data.metaMetaData.length == 2
    }

    if(event.event == 'toggle') {
      if(ready() && !merged.data.open) {
        return true
      } else {
        return false
      }
    } else {
      return merged.data.open
    }
  }

  var nextData = () => {
    if(event.event == 'data-loaded') {
      return merged.data.metaMetaData.concat({
        data: event.data,
        type: event.type
      })
    } else {
      return merged.data.metaMetaData
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
