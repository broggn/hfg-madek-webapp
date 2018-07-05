import l from 'lodash'
import t from '../../lib/i18n-translate.js'
import cx from 'classnames/dedupe'
import async from 'async'
import url from 'url'
import xhr from 'xhr'
import getRailsCSRFToken from '../../lib/rails-csrf-token.coffee'
import BoxBatchEdit from './BoxBatchEdit.js'
import setUrlParams from '../../lib/set-params-for-url.coffee'
import BoxFetchListData from './BoxFetchListData.js'
import BoxResource from './BoxResource.js'

var requestId = Math.random()

module.exports = ({event, trigger, initial, components, data, nextProps}) => {

  var needsFetchListData = () => {
    return (event.action == 'page-loaded' &&  nextProps.get.config.layout == 'list')
      || event.action == 'fetch-list-data'
      || event.action == 'reset-list-meta-data-job'
      || event.action == 'finish-list-meta-data-job'
  }

  var next = () => {


    if(event.action == 'fetch-next-page' || event.action == 'force-fetch-next-page') {
      fetchNextPage()
    }


    if(needsFetchListData()) {
      fetchListData()
    }

    if(initial) {
      return {
        data: {
          loadingNextPage: false,
          listJobQueue: []
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
          listJobQueue: nextListJobQueue()
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

  var mapResource = (resource) => {
    return {
      reset: false,
      reduce: BoxResource,
      props: {
        resource: resource
      }
    }
  }

  var mapResources = (resources) => {
    return l.map(
      resources,
      (r) => mapResource(r)
    )
  }

  var extractResources = () => {
    return l.map(
      components.resources,
      (r) => r.data.resource
    )
  }

  var nextResources = () => {

    if(initial) {
      return mapResources(nextProps.get.resources)
    }
    else if(event.action == 'force-fetch-next-page') {
      return []
    }
    else if(event.action == 'page-loaded') {
      return mapResources(l.concat(
        extractResources(),
        event.resources
      ))
    }
    else if(event.action == 'finish-list-meta-data-job') {
      return mapResources(l.map(
        extractResources,
        (r) => {
          if(r.uuid == event.job.uuid) {
            return l.merge(
              r,
              {list_meta_data: event.json}
            )
          } else {
            return r
          }
        }
      ))

    }
    else {
      return mapResources(extractResources())
    }
  }

  var nextListJobQueue = () => {

    if(event.action == 'reset-list-meta-data-job') {
      return BoxFetchListData.todo(
        l.concat(
          l.filter(
            data.listJobQueue,
            (j) => j.uuid != event.job.uuid
          ),
          l.merge(
            j,
            {state: 'initial'}
          )
        ),
        extractResources()
      )
    }
    else if(event.action == 'finish-list-meta-data-job') {
      return BoxFetchListData.todo(
        l.filter(
          data.listJobQueue,
          (j) => j.uuid != event.job.uuid
        ),
        extractResources()
      )
    }
    else if(needsFetchListData()) {
      return BoxFetchListData.todo(
        data.listJobQueue,
        extractResources()
      )
    } else {
      return data.listJobQueue
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

  var fetchListData = () => {
    BoxFetchListData.loadJobs(
      nextListJobQueue(),
      (result) => {
        if(result.status == 'failure') {
          trigger({action: 'reset-list-meta-data-job', job: result.job})
        } else {
          trigger({action: 'finish-list-meta-data-job', job: result.job, json: result.json})
        }
      }
    )
  }

  return next()
}
