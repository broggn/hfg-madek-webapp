import React from 'react'.default
ReactDOM = require('react-dom')

module.exports = React.createClass
  displayName: 'Tabs'

  render: ({authToken} = @props) ->
    <ul className="ui-tabs large">
      {@props.children}
    </ul>
