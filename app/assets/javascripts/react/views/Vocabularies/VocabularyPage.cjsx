React = require('react')
f = require('lodash')
t = require('../../../lib/string-translation.js')('de')
Icon = require('../../ui-components/Icon.cjsx')
PageContent = require('../PageContent.cjsx')
PageHeader = require('../../ui-components/PageHeader.js')
Tabs = require('../Tabs.cjsx')
Tab = require('../Tab.cjsx')
TabContent = require('../TabContent.cjsx')

module.exports = React.createClass
  displayName: 'VocabularyPage'

  _tabsConfig: (actions) ->
    [
      {
        visible: true
        path: actions.vocabulary,
        label: t('vocabularies_tabs_vocabulary')
      },
      {
        visible: @props.page.show_keywords,
        path: actions.vocabulary_keywords,
        label: t('vocabularies_tabs_keywords')
      },
      {
        visible: true
        path: actions.vocabulary_contents,
        label: t('vocabularies_tabs_contents')
      },
      {
        visible: true # TODO: policy???
        path: actions.vocabulary_permissions,
        label: t('vocabularies_tabs_permissions')
      }
    ]

  render: ({get, children, location} = @props) ->
    {page} = get
    {vocabulary, actions} = page
    {label} = vocabulary
    currentPath = location.pathname

    headerActions =
      <a href={actions.index} className='button'>
        <Icon i='undo' /> {t('vocabularies_all')}
      </a>

    <PageContent>
      <PageHeader title={label} icon='tags' actions={headerActions} />

      <Tabs>
        {
          f.map @_tabsConfig(actions), (tab) ->

            if tab.visible || tab.path == currentPath
              <Tab label={tab.label}
                href={tab.path} key={'tab_' + tab.path}
                active={tab.path == currentPath} />
        }
      </Tabs>

      <TabContent>
        {children}
      </TabContent>

    </PageContent>
