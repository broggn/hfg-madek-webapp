import l from 'lodash'
import t from '../../lib/i18n-translate.js'
import cx from 'classnames/dedupe'
import async from 'async'
import url from 'url'
import xhr from 'xhr'
import getRailsCSRFToken from '../../lib/rails-csrf-token.coffee'
import BoxBatchEditInvalids from './BoxBatchEditInvalids.js'
import setUrlParams from '../../lib/set-params-for-url.coffee'
import BoxResource from './BoxResource.js'
import BoxRedux from './BoxRedux.js'
import qs from 'qs'

module.exports = (merged) => {

  let {event, trigger, initial, components, data, nextProps} = merged

  // var cachedToApplyMetaData = toApplyMetaData(event, merged, components, data)

  var anyResourceJustFinished = l.filter(
    components.resources,
    (r) => r.components.resourceBatch.event.action == 'apply-success'
  ).length > 0

  var thereAreUnfinished = l.filter(
    components.resources,
    (r) => (r.components.resourceBatch.data.applyPending || r.components.resourceBatch.data.applyingMetaData) && !(r.components.resourceBatch.event.action == 'apply-success')
  ).length > 0

  var thereAreFailures = l.filter(
    components.resources,
    (r) => r.components.resourceBatch.data.applyError
  ).length > 0

  var successfulCount = l.filter(
    components.resources,
    (r) => (r.components.resourceBatch.data.applyDone || r.components.resourceBatch.event.action == 'apply-success')
  ).length

  var processingJustDone = !(thereAreUnfinished || thereAreFailures) && anyResourceJustFinished

  var willFetch = () => {

    return event.action == 'fetch-next-page' || event.action == 'force-fetch-next-page'

      || (
        event.action == 'page-loaded' && components.batch.data.open
        && (components.resources.length + event.resources.length < nextProps.get.pagination.total_count)
      )
      || (
        components.batch && components.batch.event.action == 'toggle'
        && (components.resources.length < nextProps.get.pagination.total_count)
      )
  }

  var anyResourceApply = l.filter(
    components.resources,
    (r) => r.event.action == 'apply'
  ).length > 0

  var willStartApply = () => {
    return formsValid(merged) && (event.action == 'apply' || event.action == 'apply-selected' || anyResourceApply)
  }

  var anyApplyAction = () => {
    return event.action == 'apply' || event.action == 'apply-selected' || l.find(
      components.resources, (rs) => rs.event.action == 'apply'
    )
  }


  var todoLoadMetaData = () => {

    if(thereAreUnfinished || nextProps.get.config.layout != 'list') {
      return {}
    }



    var alreadyLoadingCount = () => {
      return l.filter(
        components.resources,
        (r) => {
          return r.data.loadingListMetaData && !(r.event.action == 'load-meta-data-success') && !(r.event.action == 'load-meta-data-failure')
        }
      ).length
    }

    var availableCount = () => {
      return 10 - alreadyLoadingCount()
    }

    var needLoading = () => {
      return l.filter(
        components.resources,
        (r) => {
          return !r.data.listMetaData && !r.data.loadingListMetaData && !(r.event.action == 'load-meta-data-success')
        }
      )
    }

    var existingUuidsToLoad = () => {
      var r = l.map(
        needLoading(),
        (r) => r.data.resource.uuid
      )
      return r
    }

    var additionalOnes = () => {
      if(initial) {
        return l.filter(
          nextProps.get.resources,
          (r) => !r.list_meta_data
        )
      } else if(event.action == 'page-loaded') {
        return l.filter(
          event.resources,
          (r) => !r.list_meta_data
        )
      } else {
        return []
      }

    }

    var newUuidsToLoad = () => {
      return l.map(
        additionalOnes(),
        (r) => r.uuid
      )
    }

    var uuidsToLoad = () => {
      var r = l.slice(l.concat(
        existingUuidsToLoad(),
        newUuidsToLoad()
      ), 0, availableCount())

      return r
    }




    return l.fromPairs(
      l.map(
        uuidsToLoad(),
        (uuid) => [uuid, uuid]
      )
    )
  }


  return {
    // cachedToApplyMetaData: cachedToApplyMetaData,
    anyResourceJustFinished: anyResourceJustFinished,
    thereAreUnfinished: thereAreUnfinished,
    thereAreFailures: thereAreFailures,
    processingJustDone: processingJustDone,
    willFetch: willFetch(),
    willStartApply: willStartApply(),
    anyApplyAction: anyApplyAction(),
    anyResourceApply: anyResourceApply,
    todoLoadMetaData: todoLoadMetaData(),
    successfulCount: successfulCount
  }
}


// var toApplyMetaData = (event, merged, components, data) => {
//
//   if(!formsValid(merged)) {
//     return []
//   }
//
//   var resourceNeedsApply = (r) => {
//
//     var hasSelectedApply = () => {
//       return event.action == 'apply-selected'
//         && l.find(
//           data.selectedResources,
//           (sr) => sr.uuid == r.data.resource.uuid
//         )
//     }
//
//     return r.data.resource.editable && !r.components.resourceBatch.data.applyingMetaData && (
//       r.components.resourceBatch.data.applyPending || r.event.action == 'apply' || r.event.action == 'retry' || event.action == 'apply' || hasSelectedApply()
//     ) && !(r.components.resourceBatch.event.action == 'apply-success')
//   }
//
//   var resourceIsApplying = (r) => {
//     return r.components.resourceBatch.data.applyingMetaData && !(r.components.resourceBatch.event.action == 'apply-success')
//   }
//
//   var candidates = () => {
//     return l.filter(
//       components.resources,
//       (r) => {
//         return resourceNeedsApply(r)
//       }
//     )
//   }
//
//   var loading = () => {
//     return l.filter(
//       components.resources,
//       (r) => resourceIsApplying(r)
//     )
//   }
//
//   var maxParallel = () => {
//
//     // The first update is sent isolated (not in parallel), because we need the first
//     // to create the not existing keywords. Otherwise several will try to create them
//     // in parallel resulting in not unique exceptions.
//     var hasDone = l.filter(components.resources, (rs) => rs.components.resourceBatch.event.action == 'apply-success' || rs.components.resourceBatch.data.applyDone).length >= 1
//     if(!hasDone) {
//       return 1
//     } else {
//       return 12
//     }
//   }
//
//
//   return l.slice(candidates(), 0, maxParallel() - loading().length)
// }

var formsValid = (merged) => {
  if(merged.initial) {
    return false
  }
  return l.isEmpty(
    BoxBatchEditInvalids(merged.components.batch)
  )
}
