React = require('react')
f = require('active-lodash')
classList = require('classnames/dedupe')
parseMods = require('../../lib/ui.coffee').parseMods
t = require('../../../lib/string-translation')('de')
RailsForm = require('../../lib/forms/rails-form.cjsx')
Button = require('../../ui-components/Button.cjsx')
AskModal = require('../../ui-components/AskModal.cjsx')

module.exports = React.createClass
  displayName: 'DeleteModal'

  render: ({resourceType, onModalOk, onModalCancel, modalTitle} = @props) ->
    type = switch resourceType
      when 'Collection'
        'collection'
      when 'MediaEntry'
        'media_entry'
    <AskModal title={t(type + '_ask_delete_title')}
      onCancel={onModalCancel} onOk={onModalOk}
      okText={t('resource_ask_delete_ok')}
      cancelText={t('resource_ask_delete_cancel')}>
      <p className="pam by-center">
        {t(type + '_ask_delete_question_pre')}
        <strong>{modalTitle}</strong>
        {t('resource_ask_delete_question_post')}
      </p>
    </AskModal>