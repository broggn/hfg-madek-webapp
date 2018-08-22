import l from 'lodash'
import t from '../../lib/i18n-translate.js'
import cx from 'classnames/dedupe'
import async from 'async'
import url from 'url'
import xhr from 'xhr'
import getRailsCSRFToken from '../../lib/rails-csrf-token.coffee'


module.exports = ({event, data, initial, nextProps}) => {

  var next = () => {

    var initialValues = () => {
      if(!nextProps.values) {
        return ''
      } else {
        return nextProps.values[0]
      }
    }

    if(initial) {
      return {
        data: {
          text: initialValues()
        }
      }
    } else {
      return {
        data: {
          text: nextText()
        }
      }
    }
  }


  var nextText = () => {
    if(event.action == 'change-text'){
      return event.text
    } else {
      return data.text
    }
  }

  return next()
}
