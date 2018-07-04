import l from 'lodash'
import t from '../../lib/i18n-translate.js'
import cx from 'classnames/dedupe'
import async from 'async'
import url from 'url'
import xhr from 'xhr'
import getRailsCSRFToken from '../../lib/rails-csrf-token.coffee'
import BoxBatchEdit from './BoxBatchEdit.js'
import setUrlParams from '../../lib/set-params-for-url.coffee'

var requestId = Math.random()

module.exports = ({event, trigger, initial, components, data, nextProps}) => {

  var next = () => {


    if(event.action == 'fetch-next-page') {
      fetchNextPage()
    }

    if(initial) {
      return {
        data: {
          resources: nextProps.get.resources,
          loadingNextPage: false
        },
        components: {
          batch: nextBatch()
        }
      }
    } else {
      return {
        data: {
          resources: nextResources(),
          loadingNextPage: nextLoadingNextPage()
        },
        components: {
          batch: nextBatch()
        }
      }
    }
  }

  var nextLoadingNextPage = () => {
    if(event.action == 'fetch-next-page') {
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
    if(event.action == 'page-loaded') {
      return l.concat(
        data.resources,
        event.resources
      )
    }
    else {
      return data.resources
    }
  }

  var fetchNextPage = () => {


    var pagination = nextProps.get.pagination


    var pageSize = nextProps.get.config.per_page

    var page = Math.ceil(data.resources.length / pageSize)

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
        // if err || res.statusCode > 400
        //   return callback(err || body)
        //
        // this.setState({
        //   resources: this.state.resources.concat(
        //     f.get(body, @getJsonPath())
        //   )
        // }, () =>
        //   callback(null)
        // )
        //
        // if @_mergeGet(@props, @state).config.layout == 'list'
        //   @fetchListData()

      }
    )


  }

  return next()
}
