import React from 'react'
import ReactDOM from 'react-dom'
import xhr from 'xhr'
import url from 'url'
import qs from 'qs'
import l from 'lodash'
import Scrolling from './Scrolling.js'
import cx from 'classnames/dedupe'
import SuperBoxRenderContent from './SuperBoxRenderContent.jsx'

class SuperBoxRenderBox extends React.Component {

  constructor(props) {
    super(props)
    this.state = {}
  }

  componentDidMount() {
  }

  componentWillUnmount() {
  }

  boxClasses(config) {
    return cx(
      {
        'ui-container': true,
        'midtone': config.withBox,
        'bordered': config.withBox
      },
      config.mods,
      'ui-polybox'
    )
  }

  listHolderClasses(config)  {
    return cx(
      'ui-resources-holder',
      {
        pam: config.withBox
      }
    )
  }

  render() {

    var withBox = this.props.withBox
    var mods = this.props.mods
    var listMods = this.props.listMods
    var resources = this.props.resources
    var perPage = this.props.perPage

    return (
      <div data-test-id='resources-box' className={this.boxClasses({withBox: withBox, mods: mods})}>
        <div className={this.listHolderClasses({withBox: withBox})}>
          <div className='ui-container table auto'>
            <div className='ui-container table-cell table-substance'>
              <SuperBoxRenderContent
                resources={resources}
                withBox={withBox}
                mods={mods}
                listMods={listMods}
                perPage={perPage}
              />
            </div>
          </div>
        </div>
      </div>
    )

  }
}

module.exports = SuperBoxRenderBox
