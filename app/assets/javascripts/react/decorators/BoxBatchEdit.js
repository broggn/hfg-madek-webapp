import l from 'lodash'
import t from '../../lib/i18n-translate.js'
import cx from 'classnames/dedupe'
import async from 'async'
import url from 'url'
import xhr from 'xhr'
import getRailsCSRFToken from '../../lib/rails-csrf-token.coffee'
import BoxBatchTextInput from './BoxBatchTextInput.js'


module.exports = (last, props, trigger, realProps) => {

  var next = () => {

    if(props.event.event == 'mount') {
      asyncLoadData('MediaEntry')
      asyncLoadData('Collection')
    }

    if(!last) {
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
      return l.find(last.components.metaKeyForms, (f) => f.props.metaKeyId == props.event.metaKeyId)
    }

    var allMetaKeysById = () => {
      var metaMetaData = last.data.metaMetaData

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

    var findMetaKey = (metaKeyId) => {
      return allMetaKeysById()[metaKeyId]
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

    var mapExisting = () => {
      return l.map(
        last.components.metaKeyForms,
        (c) => {
          return {
            reset: false,
            reduce: BoxBatchTextInput,
            props: {
              metaKeyId: c.props.metaKeyId,
              metaKey: findMetaKey(c.props.metaKeyId)
            }
          }
        }
      )
    }


    if(props.event.event == 'select-key') {
      if(!findMetaKeyForm(props.event.metaKeyId)) {
        return l.concat(
          mapExisting(),
          {
            reset: false,
            reduce: BoxBatchTextInput,
            props: {
              metaKeyId: props.event.metaKeyId,
              metaKey: findMetaKey(props.event.metaKeyId)
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
      return last.data.metaMetaData.length == 2
    }

    if(props.event.event == 'toggle') {
      if(ready() && !last.data.open) {
        return true
      } else {
        return false
      }
    } else {
      return last.data.open
    }
  }

  var nextData = () => {
    if(props.event.event == 'data-loaded') {
      return last.data.metaMetaData.concat({
        data: props.event.data,
        type: props.event.type
      })
    } else {
      return last.data.metaMetaData
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
