import React from 'react'
import ReactDOM from 'react-dom'
import l from 'lodash'
import t from '../../lib/i18n-translate.js'
import cx from 'classnames/dedupe'
import BoxBatchEditMetaKeyForm from './BoxBatchEditMetaKeyForm.jsx'



class BoxBatchDatumText extends React.Component {

  constructor(props) {
    super(props)
  }

  render() {
    var metaKey = this.props.metaKeyForm.metaKey
    return (
      <div>
        {metaKey.uuid}
      </div>
    )
  }
}

module.exports = BoxBatchDatumText
