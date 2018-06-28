import React from 'react'
import ReactDOM from 'react-dom'
import l from 'lodash'
import t from '../../lib/i18n-translate.js'
import cx from 'classnames/dedupe'



class BoxBatchDatumText extends React.Component {

  constructor(props) {
    super(props)
  }

  onChange(event) {
    this.props.metaKeyForm
    debugger
  }

  render() {
    var metaKeyForm = this.props.metaKeyForm

    return (
      <input value={metaKeyForm.data.text} onChange={(e) => this.onChange(e)}/>
    )

    // var metaKey = metaKeyForm.metaKey
    // var textForm = metaKeyForm.form
    // return (
    //   <div>
    //     {metaKey.uuid}
    //     <input value={textForm.value} onChange={(e) => this.onChange(e)}/>
    //   </div>
    // )
  }
}

module.exports = BoxBatchDatumText
