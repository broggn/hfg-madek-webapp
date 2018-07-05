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
          resources: nextProps.get.resources,
          loadingNextPage: false,
          listJobQueue: []
        },
        components: {
          batch: nextBatch()
        }
      }
    } else {
      return {
        data: {
          resources: nextResources(),
          loadingNextPage: nextLoadingNextPage(),
          listJobQueue: nextListJobQueue()
        },
        components: {
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

  var nextResources = () => {
    if(event.action == 'force-fetch-next-page') {
      return []
    }
    else if(event.action == 'page-loaded') {
      return l.concat(
        data.resources,
        event.resources
      )
    }
    else if(event.action == 'finish-list-meta-data-job') {
      return l.map(
        data.resources,
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
      )

    }
    else {
      return data.resources
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
          _.merge(
            j,
            {state: 'initial'}
          )
        ),
        data.resources
      )
    }
    else if(event.action == 'finish-list-meta-data-job') {
      return BoxFetchListData.todo(
        l.filter(
          data.listJobQueue,
          (j) => j.uuid != event.job.uuid
        ),
        data.resources
      )
    }
    else if(needsFetchListData()) {
      return BoxFetchListData.todo(
        data.listJobQueue,
        data.resources
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
