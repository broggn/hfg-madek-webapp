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

module.exports = ({event, trigger, initial, components, data, nextProps}) => {


  var cachedToApplyMetaData = toApplyMetaData(event, components)

  var processingDone = l.filter(
    components.resources,
    (r) => (r.data.applyPending || r.data.applyingMetaData) && r.event.action != 'reload-meta-data-success'
  ).length == 0 && l.filter(
    components.resources,
    (r) => r.event.action == 'reload-meta-data-success'
  ).length > 0

  console.log('processing done = ' + processingDone)


  var next = () => {

    applyMetaData(data, components, cachedToApplyMetaData, nextApplyFormData())


    if(event.action == 'fetch-next-page' || event.action == 'force-fetch-next-page') {
      fetchNextPage()
    }

    if(initial) {
      return {
        data: {
          loadingNextPage: false,
          selectedResources: null,
          applyFormData: null
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
          selectedResources: nextSelectedResources(),
          applyFormData: nextApplyFormData()
        },
        components: {
          resources: nextResources(),
          batch: nextBatch()
        }
      }
    }
  }

  var nextApplyFormData = () => {

    var anyApply = () => {
      return l.filter(
        components.resources,
        (r) => r.event.action == 'apply'
      ).length > 0
    }

    if(event.action == 'apply' || anyApply()) {
      return l.map(
        components.batch.components.metaKeyForms,
        (mkf) => {
          return {
            data: mkf.data,
            props: mkf.props
          }
        }
      )
    } else {
      return data.applyFormData
    }
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
    return {
      reset: false,
      reduce: BoxBatchEdit,
      props: {
        mount: event.action == 'mount'
      }
    }
  }

  var mapResource = (resource, todoLoadMetaData) => {
    return {
      reset: false,
      reduce: BoxResource,
      props: {
        resource: resource,
        loadMetaData: (todoLoadMetaData[resource.uuid] ? true : false),
        startApply: l.includes(
          l.map(cachedToApplyMetaData, (r) => r.data.resource.uuid),
          resource.uuid
        ),
        cancelApply: event.action == 'cancel-all',
        waitApply: event.action == 'apply',
        resetStatus: processingDone
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

  var mapResources = (resources, todoLoadMetaData) => {
    return l.map(
      resources,
      (r) => mapResource(r, todoLoadMetaData)
    )
  }

  var extractResources = () => {
    return l.map(
      components.resources,
      (r) => r.data.resource
    )
  }

  var nextResources = () => {

    var toLoadOrLoading = () => {
      return l.filter(
        components.resources,
        (r) => {
          return r.data.listMetaData == null && !(r.event.action == 'load-meta-data-success')
        }
      )
    }

    var loadQueue = () => {
      return l.slice(toLoadOrLoading(), 0, 10)
    }

    var loadQueueToTrigger = () => {
      return l.filter(
        loadQueue(),
        (r) => !r.data.loadingListMetaData
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
      return mapResources(nextProps.get.resources, {})
    }
    else if(event.action == 'force-fetch-next-page') {
      return []
    }
    else if(event.action == 'page-loaded') {
      return mapResources(
        l.concat(
          extractResources(),
          event.resources
        ),
        (nextProps.get.config.layout == 'list' ? todoLoadMetaData() : {})
      )
    }
    else {

      var hasChildMetaDataFetchEvent = !l.isEmpty(l.filter(
        components.resources,
        (r) => r.event.action == 'load-meta-data-success'
      ))

      var needsFetchListData = hasChildMetaDataFetchEvent || event.action == 'fetch-list-data'

      return mapResources(
        extractResources(),
        (needsFetchListData ? todoLoadMetaData() : {})
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

        trigger({
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
      resourceState.trigger({action: 'apply-success'})
    }
  )

}




// var resourcesWithApplyEvent = () => {
//   return l.filter(
//     components.resources,
//     (r) => r.event.action == 'apply' || r.event.action == 'reload-meta-data-success'
//   )
// }
//
// var anyResourceApplyEvent = () => {
//   return !l.isEmpty(resourcesWithApplyEvent())
// }
//
// console.log('resources with event = ' + JSON.stringify(l.map(resourcesWithApplyEvent(), (r) => r.data.resource.uuid)))

var toApplyMetaData = (event, components) => {

  // if(!anyResourceApplyEvent()) {
  //   return []
  // }

  var resourceNeedsApply = (r) => {
    return !r.data.applyingMetaData && (
      r.data.applyPending || r.event.action == 'apply' || event.action == 'apply'
    ) && !(r.event.action == 'reload-meta-data-success')
  }

  var resourceIsApplying = (r) => {
    return r.data.applyingMetaData
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

  return l.slice(candidates(), 0, 5 - loading().length)


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
