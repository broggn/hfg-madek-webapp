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

module.exports = ({event, trigger, initial, components, data, nextProps}) => {

  var next = () => {
    if(initial) {
      return {
        data: {
          resource: nextProps.resource
        },
        components: {
        }
      }
    } else {
      return {
        data: {
          resource: nextResource()
        },
        components: {
        }
      }
    }
  }

  var nextResource = () => {
    return data.resource
  }

  return next()
}
