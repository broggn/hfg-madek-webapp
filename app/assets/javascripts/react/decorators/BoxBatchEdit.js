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
import BoxRedux from './BoxRedux.js'


module.exports = ({event, trigger, initial, components, data, nextProps, path}) => {

  var cachedAllMetaKeysById = null

  var next = () => {

    if(initial) {
      return {
        data: {
          open: false,
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
          invalidMetaKeyUuids: nextInvalidMetaKeyUuids()
        },
        components: {
          loadMetaMetaData: nextLoadMetaMetaData(),
          metaKeyForms: nextMetaKeyForms()
        }
      }
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

    var props = {
      mount: nextProps.mount
    }

    var id = (initial ? BoxRedux.nextId() : components.loadMetaMetaData.id)
    var r = BoxBatchLoadMetaMetaData(
      {
        event: (initial ? {} : components.loadMetaMetaData.event),
        trigger: trigger,
        initial: initial,
        components: (initial ? {} : components.loadMetaMetaData.components),
        data: (initial ? {} : components.loadMetaMetaData.data),
        nextProps: props,
        path: l.concat(path, ['loadMetaMetaData'])
      }
    )
    r.props = props
    r.id = id
    r.path = l.concat(path, ['loadMetaMetaData'])
    return r
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

    var reuseMetaKeyForm = (metaKeyForm, componentId, metaKeyId, index) => {

      var props = {
        metaKeyId: metaKeyId,
        metaKey: findMetaKey(metaKeyId),
        mandatoryForTypes: mandatoryForTypes(metaKeyId),
        invalid: l.includes(nextInvalidMetaKeyUuids(), metaKeyId)
      }

      var r = decideReduce(metaKeyId)(
        {
          event: metaKeyForm.event,
          trigger: trigger,
          initial: false,
          components: metaKeyForm.components,
          data: metaKeyForm.data,
          nextProps: props,
          path: ['batch', ['metaKeyForms', index]]
        }
      )
      r.props = props
      r.id = metaKeyForm.id
      r.path = ['batch', ['metaKeyForms', index]]
      return r
    }

    var newMetaKeyForm = (componentId, metaKeyId, index) => {

      var props = {
        metaKeyId: metaKeyId,
        metaKey: findMetaKey(metaKeyId),
        mandatoryForTypes: mandatoryForTypes(metaKeyId),
        invalid: l.includes(nextInvalidMetaKeyUuids(), metaKeyId)
      }

      var id = BoxRedux.nextId()
      var r = decideReduce(metaKeyId)(
        {
          event: {},
          trigger: trigger,
          initial: true,
          components: {},
          data: {},
          nextProps: props,
          path: ['batch', ['metaKeyForms', index]]
        }
      )
      r.props = props
      r.id = id
      r.path = ['batch', ['metaKeyForms', index]]
      return r
    }

    var mapExisting = () => {
      return l.map(
        withoutClosed(),
        (c, i) => reuseMetaKeyForm(c, c.id, c.props.metaKeyId, i)
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

    if(event.action == 'select-key' && !findMetaKeyForm(event.metaKeyId)) {
      var existing = mapExisting()
      return l.concat(
        existing,
        newMetaKeyForm(null, event.metaKeyId, existing.length)
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
