import l from 'lodash'
import t from '../../lib/i18n-translate.js'
import cx from 'classnames/dedupe'
import async from 'async'
import url from 'url'
import xhr from 'xhr'
import getRailsCSRFToken from '../../lib/rails-csrf-token.coffee'


module.exports = (merged) => {

  var next = () => {

    if(merged.initial) {
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
    if(merged.event.event == 'new-text'){
      return merged.event.text
    } else {
      return merged.data.text
    }
  }

  return next()
}
