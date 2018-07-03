import l from 'lodash'
import t from '../../lib/i18n-translate.js'
import cx from 'classnames/dedupe'
import async from 'async'
import url from 'url'
import xhr from 'xhr'
import getRailsCSRFToken from '../../lib/rails-csrf-token.coffee'
import BoxBatchTextInput from './BoxBatchTextInput.js'
import BoxBatchDateInput from './BoxBatchDateInput.js'


module.exports = ({event, trigger, initial, components, data}) => {

  var cachedAllMetaKeysById = null

  var next = () => {

    if(event.action == 'mount') {
      asyncLoadData('MediaEntry')
      asyncLoadData('Collection')
    }

    if(initial) {
      return {
        data: {
          metaMetaData: [],
          open: false
        },
        components: {
          metaKeyForms: []
        }
      }
    } else {
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
              data.metaMetaData,
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
        components.metaKeyForms,
        (f) => {
          return f.event.action != 'close'
        }
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



    if(event.action == 'select-key') {
      if(!findMetaKeyForm(event.metaKeyId)) {
        return l.concat(
          mapExisting(),
          createBoxBatchEdit(event.metaKeyId)
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
      return data.metaMetaData.length == 2
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
