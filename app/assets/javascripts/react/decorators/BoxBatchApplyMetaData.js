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

    if(nextProps.action == 'apply') {
      applyMetaData({
        resourceId: nextProps.resourceId,
        resourceType: nextProps.resourceType,
        formData: nextProps.metaKeyForms
      })
    }

    if(initial) {
      return {
        data: {},
        components: {}
      }
    } else {
      return {
        data: {},
        components: {}
      }
    }
  }

  
  return next()
}
