React = require('react')
ReactDOM = require('react-dom')
f = require('active-lodash')
cx = require('classnames')
libUrl = require('url')
qs = require('qs')
PageContent = require('./PageContent.cjsx')
PageContentHeader = require('./PageContentHeader.cjsx')
DashboardHeader = require('./DashboardHeader.cjsx')
t = require('../../lib/string-translation.js')('de')
AsyncDashboardSection = require('../lib/AsyncDashboardSection.cjsx')
Sidebar = require('./Sidebar.cjsx')
TagCloud = require('../ui-components/TagCloud.cjsx')
Preloader = require('../ui-components/Preloader.cjsx')

module.exports = React.createClass
  displayName: 'DashboardSectionResources'

  getInitialState: () ->
    {
      result: null
    }

  _callback: (result) ->
    @setState(result: result)

  render: ({section} = @props) ->

    is_clipboard = section.id == 'clipboard'
    is_unpublished_entries = section.id == 'unpublished_entries'
    ui_component = 'Deco.MediaResourcesBox'

    with_box = false
    mods = ['unpaginated']
    fallback = if section['is_empty?'] then true else false

    initial_props = {
      mods: mods,
      withBox: with_box,
      fallback: fallback,
      enableOrdering: true,
      enableOrderByTitle: true,
      initial: {
        show_filter: false,
        is_clipboard: is_clipboard
      }
    }

    <div id={section.id}>

      <div className='ui-resources-header'>
        <h2 className='title-l ui-resources-title'>
          {section.title}
        </h2>

        {
          if @state.result == null
            style = {
              width: '100px',
              height: '10px'
              marginTop: '10px',
              marginLeft: '30px',
              display: 'inline-block'
            }
            <Preloader mods='small' style={style} />
          else if @state.result == 'empty'
            <span style={{marginLeft: '10px'}}>{t('dashboard_none_exist')}</span>
          else
            <a className='strong' href={'/my/' + section.id}>
              {t('dashboard_show_all')}
            </a>
        }

      </div>

      <AsyncDashboardSection
        component={ui_component}
        url={'/my?___sparse={"user_dashboard":{"' + section.id + '":{}}}'}
        json_path={'user_dashboard.' + section.id}
        fallback_url={'/my/' + section.id}
        initial_props={initial_props}
        callback={@_callback}
        renderEmpty={@state.result == null}
      />
    </div>