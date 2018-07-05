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

  var next = () => {

    var resourcesWithApplyEvent = l.filter(
      components.resources,
      (r) => r.event.action == 'apply'
    )

    if(!l.isEmpty(resourcesWithApplyEvent)) {
      l.each(
        resourcesWithApplyEvent,
        (r) => {
          applyMetaData(
            {
              resourceState: r,
              formData: l.map(
                components.batch.components.metaKeyForms,
                (mkf) => {
                  return {
                    data: mkf.data,
                    props: mkf.props
                  }
                }
              )
            }
          )
        }
      )
    }


    if(event.action == 'fetch-next-page' || event.action == 'force-fetch-next-page') {
      fetchNextPage()
    }

    if(initial) {
      return {
        data: {
          loadingNextPage: false
        },
        components: {
          resources: nextResources(),
          batch: nextBatch()
        }
      }
    } else {
      return {
        data: {
          loadingNextPage: nextLoadingNextPage()
        },
        components: {
          resources: nextResources(),
          batch: nextBatch()
        }
      }
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
        loadMetaData: (todoLoadMetaData[resource.uuid] ? true : false)
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





  var applyMetaData = ({resourceState, formData}) => {

    var resourceId = resourceState.event.uuid
    var resourceType = resourceState.event.type


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



  return next()
}
