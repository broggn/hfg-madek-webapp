import l from 'lodash'
import t from '../../lib/i18n-translate.js'
import cx from 'classnames/dedupe'
import async from 'async'
import url from 'url'
import xhr from 'xhr'
import getRailsCSRFToken from '../../lib/rails-csrf-token.coffee'
import BoxBatchEdit from './BoxBatchEdit.js'


module.exports = ({event, trigger, initial, components, data}) => {

  var next = () => {
    if(initial) {
      return {
        data: {},
        components: {
          batch: nextBatch()
        }
      }
    } else {
      return {
        data: {},
        components: {
          batch: nextBatch()
        }
      }
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

  return next()
}
