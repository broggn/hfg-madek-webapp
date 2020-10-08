React = require('react').default
f = require('active-lodash')
ui = require('../lib/ui.coffee')

module.exports = React.createClass
  displayName: 'Preloader'

  render: ({mods} = @props)->
    restProps = f.omit(@props, ['mods'])
    <div {...restProps} className={ui.cx(ui.parseMods(@props), 'ui-preloader')}/>
