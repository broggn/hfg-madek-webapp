import l from 'lodash'
import t from '../../lib/i18n-translate.js'
import cx from 'classnames/dedupe'
import async from 'async'
import url from 'url'
import xhr from 'xhr'
import getRailsCSRFToken from '../../lib/rails-csrf-token.coffee'


module.exports = (last, event, trigger, props) => {

  var next = () => {

    if(!last) {
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
    if(event && event.event.event == 'new-text'){
      return event.event.text
    } else {
      return last.data.text
    }
  }

  return next()
}
