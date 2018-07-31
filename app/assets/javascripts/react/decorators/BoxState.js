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
import qs from 'qs'

var requestId = Math.random()

module.exports = (merged) => {

  let {event, trigger, initial, components, data, nextProps} = merged


  var cachedToApplyMetaData = toApplyMetaData(event, components, data)

  var anyResourceJustFinished = l.filter(
    components.resources,
    (r) => r.event.action == 'apply-success'
  ).length > 0

  var thereAreUnfinished = l.filter(
    components.resources,
    (r) => (r.data.applyPending || r.data.applyingMetaData) && !(r.event.action == 'apply-success')
  ).length > 0

  var thereAreFailures = l.filter(
    components.resources,
    (r) => r.data.applyError
  ).length > 0

  var processingJustDone = !(thereAreUnfinished || thereAreFailures) && anyResourceJustFinished


  var next = () => {

    if(!l.isEmpty(cachedToApplyMetaData) && formsValid()) {
      applyMetaData(
        data,
        components,
        cachedToApplyMetaData,
        l.map(
          components.batch.components.metaKeyForms,
          (mkf) => {
            return {
              data: mkf.data,
              props: mkf.props
            }
          }
        )
      )
    }


    if(event.action == 'fetch-next-page' || event.action == 'force-fetch-next-page') {
      fetchNextPage()
    }

    if(initial) {
      return {
        data: {
          loadingNextPage: false,
          selectedResources: null
        },
        components: {
          resources: nextResources(),
          batch: nextBatch()
        }
      }
    } else {
      return {
        data: {
          loadingNextPage: nextLoadingNextPage(),
          selectedResources: nextSelectedResources()
        },
        components: {
          resources: nextResources(),
          batch: nextBatch()
        }
      }
    }
  }

  var determineInvalids = () => {

    if(initial) {
      return []
    }

    var validateForm = (f) => {

      var validateText = () => {
        return !l.isEmpty(f.data.text)
      }

      var validateKeywords = () => {
        return !l.isEmpty(f.data.keywords)
      }

      var decideValidation = (type) => {
        var mapping = {
          'MetaDatum::Text': validateText,
          'MetaDatum::TextDate': validateText,
          'MetaDatum::Keywords': validateKeywords,
          'MetaDatum::People': validateKeywords
        }
        return mapping[type]
      }


      var validator = decideValidation(f.props.metaKey.value_type)
      return validator(f)
    }

    return l.filter(
      components.batch.components.metaKeyForms,
      (mkf) => mkf.event.action != 'close' && !validateForm(mkf)
    )
  }

  var formsValid = () => {
    if(initial) {
      return false
    }
    return l.isEmpty(determineInvalids())
  }

  var nextSelectedResources = () => {
    if(event.action == 'mount' && l.includes(['MediaResources', 'MediaEntries', 'Collections'], nextProps.get.type)) {
      return []
    } else if(event.action == 'toggle-resource-selection') {
      if(l.find(data.selectedResources, (sr) => sr.uuid == event.resourceUuid)) {
        return l.reject(
          data.selectedResources,
          (sr) => sr.uuid == event.resourceUuid
        )
      } else {
        return l.concat(
          data.selectedResources,
          l.find(components.resources, (cr) => cr.data.resource.uuid == event.resourceUuid).data.resource
        )
      }
    } else if(event.action == 'unselect-resources') {
      return l.reject(
        data.selectedResources,
        (sr) => l.includes(event.resourceUuids, sr.uuid)
      )
    } else if(event.action == 'select-resources') {
      return l.concat(
        data.selectedResources,
        l.map(
          event.resourceUuids,
          (rid) => l.find(components.resources, (cr) => cr.data.resource.uuid == rid).data.resource
        )

      )
    } else {
      return data.selectedResources
    }
  }

  var nextLoadingNextPage = () => {
    if(event.action == 'fetch-next-page' || event.action == 'force-fetch-next-page') {
      return true
    }
    else if(event.action == 'page-loaded') {
      return false
    }
    else {
      return data.loadingNextPage
    }
  }

  var nextBatch = () => {

    var anyApplyAction = () => {
      return event.action == 'apply' || event.action == 'apply-selected' || l.find(
        components.resources, (rs) => rs.event.action == 'apply'
      )
    }

    var invalidUuids = () => {
      return l.map(determineInvalids(), (i) => i.props.metaKey.uuid)
    }

    var formsWithClose = () => {
      return l.filter(
        components.batch.components.metaKeyForms,
        (mkf) => mkf.event.action == 'close'
      )

    }

    var anyCloseAction = () => {
      return !l.isEmpty(formsWithClose())
    }

    var rejectClosed = () => {
      return l.reject(
        components.batch.data.invalidMetaKeyUuids,
        (id) => l.find(formsWithClose(), (f) => {
          return f.props.metaKeyId == id
        })
      )
    }

    var updateInvalids = () => {
      if(initial) {
        return []
      }
      else if(anyApplyAction()) {
        return invalidUuids()
      }
      else if(anyCloseAction()) {
        return rejectClosed()
      }
      else {
        return null
      }

    }


    return {
      reset: false,
      reduce: BoxBatchEdit,
      props: {
        mount: event.action == 'mount',
        invalidMetaKeyUuids: updateInvalids()
      }
    }
  }

  var mapResourceState = (resourceState, todoLoadMetaData) => {
    return mapResource(
      resourceState.data.resource,
      resourceState.event.action == 'apply' || resourceState.event.action == 'retry',
      todoLoadMetaData
    )
  }

  var mapResource = (resource, hasApplyEvent, todoLoadMetaData) => {

    var startApply = l.includes(
      l.map(cachedToApplyMetaData, (r) => r.data.resource.uuid),
      resource.uuid
    )

    var hasSelectedApply = () => {
      return event.action == 'apply-selected'
        && l.find(
          data.selectedResources,
          (sr) => sr.uuid == resource.uuid
        )
    }


    return {
      reset: false,
      reduce: BoxResource,
      props: {
        resource: resource,
        loadMetaData: (todoLoadMetaData[resource.uuid] ? true : false),
        startApply: formsValid() && startApply && resource.editable,
        cancelApply: event.action == 'cancel-all',
        waitApply: resource.editable && formsValid() && !startApply && (event.action == 'apply' || event.action == 'apply-selected' && hasSelectedApply() || hasApplyEvent),
        resetStatus: processingJustDone || event.action == 'ignore-all'
        // formData: l.map(
        //   components.batch.components.metaKeyForms,
        //   (mkf) => {
        //     return {
        //       data: mkf.data,
        //       props: mkf.props
        //     }
        //   }
        // )
      }
    }
  }

  var nextResources = () => {

    var toLoadOrLoading = () => {
      return l.filter(
        components.resources,
        (r) => {
          return r.data.listMetaData == null && !(r.event.action == 'load-meta-data-success') && !(r.event.action == 'load-meta-data-failure')
        }
      )
    }

    var loadQueue = () => {
      return l.slice(toLoadOrLoading(), 0, 10)
    }

    var loadQueueToTrigger = () => {
      return l.filter(
        loadQueue(),
        (r) => !r.data.loadingListMetaData || r.event.action == 'load-meta-data-failure'
      )
    }

    var todoLoadMetaData = () => {
      return l.fromPairs(
        l.map(
          loadQueueToTrigger(),
          (r) => [r.data.resource.uuid, r.data.resource.uuid]
        )
      )
    }

    if(initial) {
      return l.map(
        nextProps.get.resources,
        (r) => mapResource(r, false, {})
      )
    }
    else if(event.action == 'force-fetch-next-page') {
      return []
    }
    else if(event.action == 'page-loaded') {

      var todo = (nextProps.get.config.layout == 'list' && !thereAreUnfinished ? todoLoadMetaData() : {})

      return l.concat(
        l.map(
          components.resources,
          (rs) => mapResourceState(rs, todo)
        ),
        l.map(
          event.resources,
          (r) => mapResource(r, false, todo)
        )
      )
    }
    else {

      var hasChildMetaDataFetchEvent = !l.isEmpty(l.filter(
        components.resources,
        (r) => r.event.action == 'load-meta-data-success' || r.event.action == 'load-meta-data-failure'
      ))

      var needsFetchListData = (processingJustDone || hasChildMetaDataFetchEvent || event.action == 'fetch-list-data') && nextProps.get.config.layout == 'list' && !thereAreUnfinished

      return l.map(
        components.resources,
        (rs) => mapResourceState(rs, (needsFetchListData ? todoLoadMetaData() : {}))
      )
    }
  }

  var fetchNextPage = () => {


    var pagination = nextProps.get.pagination


    var pageSize = nextProps.get.config.per_page

    var page = Math.ceil(nextResources().length / pageSize)

    var nextPage = page + 1

    var nextUrl = setUrlParams(
      nextProps.currentUrl,
      {list: {page: nextPage}},
      {
        ___sparse: JSON.stringify(
          l.set({}, nextProps.getJsonPath(), {})
        )
      }
    )

    // We compare the request id when sending started
    // with the request id when the answer arrives and
    // only process the answer when its still the same id.
    var localRequestId = requestId

    return xhr.get(
      {
        url: nextUrl,
        json: true
      },
      (err, res, body) => {

        if(requestId != localRequestId) {
          return
        }

        trigger(merged, {
          action: 'page-loaded',
          resources: l.get(body, nextProps.getJsonPath())
        })
      }
    )
  }



  return next()
}




var applyMetaData = (data, components, cachedToApplyMetaData, formData) => {
  l.each(
    cachedToApplyMetaData,
    (r) => applyResourceMetaData(
      {
        resourceState: r,
        formData: formData
      }
    )
  )

}


var applyResourceMetaData = ({resourceState, formData}) => {

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
      'MetaDatum::TextDate': formToDataText,
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
      () => resourceState.trigger(resourceState, {action: 'apply-success'}),
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
      if(err || res.statusCode > 400) {//!= 200) {
        resourceState.trigger(resourceState, {action: 'apply-error'})
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

        resourceState.trigger(
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


var toApplyMetaData = (event, components, data) => {

  var resourceNeedsApply = (r) => {

    var hasSelectedApply = () => {
      return event.action == 'apply-selected'
        && l.find(
          data.selectedResources,
          (sr) => sr.uuid == r.data.resource.uuid
        )
    }

    return r.data.resource.editable && !r.data.applyingMetaData && (
      r.data.applyPending || r.event.action == 'apply' || r.event.action == 'retry' || event.action == 'apply' || hasSelectedApply()
    ) && !(r.event.action == 'apply-success')
  }

  var resourceIsApplying = (r) => {
    return r.data.applyingMetaData && !(r.event.action == 'apply-success')
  }

  var candidates = () => {
    return l.filter(
      components.resources,
      (r) => {
        return resourceNeedsApply(r)
      }
    )
  }

  var loading = () => {
    return l.filter(
      components.resources,
      (r) => resourceIsApplying(r)
    )
  }

  // console.log('loading = ' + loading())

  return l.slice(candidates(), 0, 12 - loading().length)


  // l.each(
  //   l.slice(candidates(), 0, 3),
  //   (r) => {
  //     applyMetaData(
  //       {
  //         resourceState: r,
  //         formData: l.map(
  //           components.batch.components.metaKeyForms,
  //           (mkf) => {
  //             return {
  //               data: mkf.data,
  //               props: mkf.props
  //             }
  //           }
  //         )
  //       }
  //     )
  //   }
  // )

}
