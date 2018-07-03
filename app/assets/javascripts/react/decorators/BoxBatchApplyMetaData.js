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

  var applyMetaData = ({resourceId, resourceType, formData}) => {

    var pathType = () => {
      return {
        'MediaEntry': 'entries',
        'Collection': 'sets'
      }[resourceType]
    }

    var url = '/' + pathType() + '/' + resourceId + '/meta_data'

    var property = () => {
      return {
        'MediaEntry': 'media_entry',
        'Collection': 'set'
      }[resourceType]
    }

    var formToDataText = (data) => {
      return [data.text]
    }

    var formToData = (fd) => {
      return {
        'MetaDatum::Text': formToDataText
      }[fd.props.metaKey.value_type](fd.data)
    }

    var metaData = () => {
      return l.fromPairs(
        l.map(
          formData,
          (fd) => [
            fd.props.metaKeyId,
            formToData(fd)
          ]
        )
      )
    }

    var data = {
      [property()]: {
        meta_data: metaData()
      }
    }

    debugger

    xhr(
      {
        url: url,
        method: 'PUT',
        body: $.param(data),
        headers: {
          'Accept': 'application/json',
          'Content-type': 'application/x-www-form-urlencoded',
          'X-CSRF-Token': getRailsCSRFToken()

        }
      },
      (err, res, json) => {
        alert('done')
      }
    )

  }

  return next()
}
