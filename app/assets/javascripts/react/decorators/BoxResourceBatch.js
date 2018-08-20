import l from 'lodash'
import t from '../../lib/i18n-translate.js'
import cx from 'classnames/dedupe'
import async from 'async'
import xhr from 'xhr'
import getRailsCSRFToken from '../../lib/rails-csrf-token.coffee'
import BoxBatchEdit from './BoxBatchEdit.js'
import setUrlParams from '../../lib/set-params-for-url.coffee'

import url from 'url'
import qs from 'qs'

var parseUrl = url.parse
var buildUrl = url.format
var buildQuery = qs.stringify
var parseQuery = qs.parse


module.exports = (merged) => {

  let {event, trigger, initial, components, data, nextProps} = merged

  let {parentEvent} = nextProps

  var next = () => {

    if(initial) {
      return {
        data: {
          applyPending: false,
          applyingMetaData: false,
          applyDone: false,
          applyCancelled: false,
          applyError: false,
          sleep: false
        },
        components: {}
      }
    } else {
      return {
        data: {
          applyPending: nextApplyPending(),
          applyingMetaData: nextApplyingMetaData(),
          applyDone: nextApplyDone(),
          applyCancelled: nextApplyCancelled(),
          applyError: nextApplyError(),
          sleep: nextSleep()
        },
        components: {}
      }
    }

  }

  var nextApplyPending = () => {
    if(nextProps.waitApply) {
      return true
    } else if(nextProps.startApply/*event.action == 'apply-success'*/ || nextProps.cancelApply) {
      return false
    } else {
      return data.applyPending
    }
  }

  var nextApplyingMetaData = () => {
    if(nextProps.startApply) {
      return true
    }
    else if(parentEvent.action == 'apply-success' || parentEvent.action == 'apply-error') {
      return false
    } else {
      return data.applyingMetaData
    }


  }

  var nextApplyDone = () => {
    if(nextProps.waitApply || nextProps.resetStatus) {
      return false
    } else if(parentEvent.action == 'apply-success') {
      return true
    } else {
      return data.applyDone
    }
  }


  var nextApplyCancelled = () => {
    if(nextProps.cancelApply && data.applyPending) {
      return true
    } else if(nextProps.resetStatus) {
      return false
    } else {
      return data.applyCancelled
    }
  }

  var nextApplyError = () => {
    if(parentEvent.action == 'apply-error') {
      return true
    } else if(nextProps.waitApply || nextProps.startApply || nextProps.resetStatus) {
      return false
    } else {
      return data.applyError
    }
  }


  var nextSleep = () => {
    if(nextProps.sleep) {
      return true
    } else if(nextProps.resetStatus) {
      return false
    } else {
      return data.sleep
    }
  }




  return next()
}
