import l from 'lodash'
import t from '../../lib/i18n-translate.js'
import cx from 'classnames/dedupe'
import async from 'async'
import url from 'url'
import xhr from 'xhr'
import getRailsCSRFToken from '../../lib/rails-csrf-token.coffee'
import BoxBatchEdit from './BoxBatchEdit.js'
import setUrlParams from '../../lib/set-params-for-url.coffee'
import BoxResource from './BoxResource.js'
import BoxRedux from './BoxRedux.js'
import qs from 'qs'
import BoxStatePrecalculate from './BoxStatePrecalculate.js'

module.exports = (data, components, cachedToApplyMetaData, formData, trigger) => {
  applyMetaData(data, components, cachedToApplyMetaData, formData, trigger)
}


var applyMetaData = (data, components, cachedToApplyMetaData, formData, trigger) => {
  l.each(
    cachedToApplyMetaData,
    (r) => applyResourceMetaData(
      {
        trigger: trigger,
        resourceState: r,
        formData: formData
      }
    )
  )

}


var applyResourceMetaData = ({trigger, resourceState, formData}) => {

  var resourceId = resourceState.data.resource.uuid
  var resourceType = resourceState.data.resource.type

  var mapScope = () => {
    return {
      'MediaEntry': 'Entries',
      'Collection': 'Sets'
    }[resourceType]
  }

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
      'Collection': 'collection'
    }[resourceType]
  }

  var formToDataText = (data) => {
    return [data.text]
  }

  var formToDataTextDate = (data) => {
    return [data.text]
  }

  var formToDataKeywords = (data) => {
    return l.map(
      data.keywords,
      (k) => {
        if(k.id) {
          return k.id
        } else {
          return {
            term: k.label
          }
        }
      }
    )
  }

  var formToDataPeople = (data) => {
    return l.map(
      data.keywords,
      (k) => {
        return k.id
      }
    )
  }


  var formToData = (fd) => {
    return {
      'MetaDatum::Text': formToDataText,
      'MetaDatum::TextDate': formToDataTextDate,
      'MetaDatum::Keywords': formToDataKeywords,
      'MetaDatum::People': formToDataPeople
    }[fd.props.metaKey.value_type](fd.data)
  }

  var metaData = () => {
    return l.fromPairs(
      l.map(
        l.filter(
          formData,
          (fd) => l.includes(fd.props.metaKey.scope, mapScope())
        ),
        (fd) => [
          fd.props.metaKeyId,
          formToData(fd)
        ]
      )
    )
  }

  if(l.isEmpty(metaData())) {
    setTimeout(
      () => trigger(resourceState, {action: 'apply-success'}),
      0
    )
    return
  }

  var data = {
    [property()]: {
      meta_data: metaData()
    }
  }

  var body = qs.stringify(
    data,
    {
      arrayFormat: 'brackets' // NOTE: Do it like rails.
    }
  )

  xhr(
    {
      url: url,
      method: 'PUT',
      body: body,
      headers: {
        'Accept': 'application/json',
        'Content-type': 'application/x-www-form-urlencoded',
        'X-CSRF-Token': getRailsCSRFToken()
      }
    },
    (err, res, json) => {
      if(err || res.statusCode != 200) {
        trigger(resourceState, {action: 'apply-error'})
      } else {

        var thumbnailMetaData = () => {
          var md = metaData()
          var getTitle = () => {
            var fd = l.find(formData, (fd) => fd.props.metaKeyId == 'madek_core:title')
            if(!fd) {
              return null
            } else {
              return fd.data.text
            }
          }
          var getAuthors = () => {
            var fd = l.find(formData, (fd) => fd.props.metaKeyId == 'madek_core:authors')
            if(!fd) {
              return null
            } else {
              return l.join(l.map(fd.data.keywords, (k) => k.label), '; ')
            }
          }
          return {
            title: getTitle(),
            authors: getAuthors()
          }
        }

        trigger(
          resourceState,
          {
            action: 'apply-success',
            thumbnailMetaData: thumbnailMetaData()
          }
        )
      }
    }
  )

}
