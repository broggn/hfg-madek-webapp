import React from 'react'
import ReactDOM from 'react-dom'
import l from 'lodash'
import t from '../../lib/i18n-translate.js'
import cx from 'classnames/dedupe'



class BoxBatchEditMetaKeyForm extends React.Component {

  constructor(props) {
    super(props)
  }

  render() {

    return (
      <div>
        {this.props.metaKeyId}
      </div>
    )
  }
}

module.exports = BoxBatchEditMetaKeyForm
