import l from 'lodash'
import t from '../../lib/i18n-translate.js'
import cx from 'classnames/dedupe'
import async from 'async'
import url from 'url'
import xhr from 'xhr'
import getRailsCSRFToken from '../../lib/rails-csrf-token.coffee'


module.exports = ({event, data, initial} = merged) => {

  var next = () => {

    if(initial) {
      return {
        data: {
          text: ''
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
    if(event.action == 'new-text'){
      return event.text
    } else {
      return data.text
    }
  }

  return next()
}
