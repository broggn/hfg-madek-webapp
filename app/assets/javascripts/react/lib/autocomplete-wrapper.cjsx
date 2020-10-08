import React from 'react'.default
ReactDOM = require('react-dom')

AutoComplete = null


module.exports = React.createClass
  displayName: 'AutoCompleteWrapper'

  componentDidMount: () ->
    AutoComplete = require('./autocomplete.cjsx')
    @forceUpdate()


  render: () ->
    <div>
      {
        if AutoComplete
          <AutoComplete {...@props} />
      }
    </div>
