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
import BoxStateApplyMetaData from './BoxStateApplyMetaData.js'
import BoxStateFetchNextPage from './BoxStateFetchNextPage.js'

module.exports = (merged) => {

  let {event, trigger, initial, components, data, nextProps} = merged
  let {
    cachedToApplyMetaData,
    anyResourceJustFinished,
    thereAreUnfinished,
    thereAreFailures,
    processingJustDone,
    willFetch,
    willStartApply,
    anyApplyAction,
    anyResourceApply,
    determineInvalids,
    todoLoadMetaData
  } = BoxStatePrecalculate(merged)





  var next = () => {

    if(!l.isEmpty(cachedToApplyMetaData)) {
      BoxStateApplyMetaData(data, components, cachedToApplyMetaData, nextApplyFormData(), trigger)
    }




    if(willFetch) {
      BoxStateFetchNextPage(merged, nextResources().length)
    }

    if(initial) {
      return {
        data: {
          loadingNextPage: false,
          selectedResources: null,
          applyFormData: null,
          resultMessage: nextResultMessage()
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
          applyFormData: nextApplyFormData(),
          resultMessage: nextResultMessage()
        },
        components: {
          resources: nextResources(),
          batch: nextBatch()
        }
      }
    }
  }





  var nextResultMessage = () => {

    var timeToShow = 3000

    if(initial) {
      return {
        status: 'hidden'
      }
    }

    else if(willStartApply) {
      return {
        status: 'hidden'
      }
    }

    else if(!thereAreUnfinished && anyResourceJustFinished) {

      var message = () => {
        if(thereAreFailures) {
          return {
            status: 'failure'
          }
        } else {

          setTimeout(
            () => {
              trigger(merged, {
                action: 'make-sure-a-trigger-is-executed-at-this-time'
              })
            },
            timeToShow
          )

          return {
            status: 'success',
            lastShow: new Date().getTime()
          }
        }
      }

      return message()
    }

    else if(data.resultMessage.status == 'success' && new Date().getTime() - data.resultMessage.lastShow >= timeToShow) {

      return {
        status: 'hidden'
      }

    }


    else {
      return data.resultMessage
    }

  }

  var nextApplyFormData = () => {


    if(willStartApply) {
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
    if(willFetch) {
      return true
    } else if(event.action == 'page-loaded') {
      return false
    } else {
      return data.loadingNextPage
    }
  }

  var nextBatch = () => {

    var invalidUuids = () => {
      return l.map(determineInvalids, (i) => i.props.metaKey.uuid)
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
      else if(anyApplyAction) {
        return invalidUuids()
      }
      else if(anyCloseAction()) {
        return rejectClosed()
      }
      else {
        return null
      }

    }


    var props = {
      mount: event.action == 'mount',
      invalidMetaKeyUuids: updateInvalids()
    }

    var id = (initial ? BoxRedux.nextId() : components.batch.id)
    var r = BoxBatchEdit(
      {
        event: (initial ? {} : components.batch.event),
        trigger: trigger,
        initial: initial,
        components: (initial ? {} : components.batch.components),
        data: (initial ? {} : components.batch.data),
        nextProps: props,
        path: ['batch']
      }
    )
    r.props = props
    r.id = id
    r.path = ['batch']
    return r
  }


  var nextResources = () => {

    var mapResourceState = (resourceState) => {

      var resource = resourceState.data.resource

      var hasApplyEvent = resourceState.event.action == 'apply' || resourceState.event.action == 'retry'


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

      var resourceProps = {
        resource: resource,
        loadMetaData: (todoLoadMetaData[resource.uuid] ? true : false),
        startApply: startApply && resource.editable,
        cancelApply: event.action == 'cancel-all',
        waitApply: resource.editable && !l.isEmpty(cachedToApplyMetaData) && !startApply && (event.action == 'apply' || event.action == 'apply-selected' && hasSelectedApply() || hasApplyEvent),
        sleep: (event.action == 'apply-selected' || anyResourceApply) && !hasSelectedApply() && !l.isEmpty(cachedToApplyMetaData),
        resetStatus: processingJustDone || event.action == 'ignore-all'
      }

      var r = BoxResource(
        {
          event: resourceState.event,
          trigger: trigger,
          initial: false,
          components: resourceState.components,
          data: resourceState.data,
          nextProps: resourceProps,
          path: resourceState.path
        }
      )
      r.props = resourceProps
      r.id = resourceState.id
      r.path = resourceState.path
      return r
    }

    var mapResource = (resource, index) => {

      var hasApplyEvent = false

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

      var resourceProps = {
        resource: resource,
        loadMetaData: (todoLoadMetaData[resource.uuid] ? true : false),
        startApply: startApply && resource.editable,
        cancelApply: event.action == 'cancel-all',
        waitApply: resource.editable && !l.isEmpty(cachedToApplyMetaData) && !startApply && (event.action == 'apply' || event.action == 'apply-selected' && hasSelectedApply() || hasApplyEvent),
        sleep: (event.action == 'apply-selected' || anyResourceApply) && !hasSelectedApply() && !l.isEmpty(cachedToApplyMetaData),
        resetStatus: processingJustDone || event.action == 'ignore-all'
      }

      var id = BoxRedux.nextId()
      var r = BoxResource(
        {
          event: {},
          trigger: trigger,
          initial: true,
          components: {},
          data: {},
          nextProps: resourceProps,
          path: l.concat([], [['resources', index]])
        }
      )
      r.props = resourceProps
      r.id = id
      r.path = l.concat([], [['resources', index]])
      return r
    }




    if(initial) {
      return l.map(
        nextProps.get.resources,
        (r, i) => mapResource(r, i)
      )
    }
    else if(event.action == 'force-fetch-next-page') {
      return []
    }
    else if(event.action == 'page-loaded') {

      return l.concat(
        l.map(
          components.resources,
          (rs) => mapResourceState(rs)
        ),
        l.map(
          event.resources,
          (r, i) => mapResource(r, components.resources.length + i)
        )
      )
    }
    else {

      return l.map(
        components.resources,
        (rs) => mapResourceState(rs)
      )
    }
  }

  return next()
}
