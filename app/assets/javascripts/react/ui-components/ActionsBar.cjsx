React = require('react').default

module.exports = React.createClass
  displayName: 'ActionsBar'
  render: ({children} = @props)->
    <div className='ui-actions'>{children}</div>
