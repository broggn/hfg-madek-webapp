React = require('react')
ReactDOM = require('react-dom')
ampersandReactMixin = require('ampersand-react-mixin')
f = require('active-lodash')
t = require('../../../lib/string-translation')('de')
RailsForm = require('../../lib/forms/rails-form.cjsx')
InputFieldText = require('../../lib/forms/input-field-text.cjsx')
FormButton = require('../../ui-components/FormButton.cjsx')
Modal = require('../../ui-components/Modal.cjsx')

module.exports = React.createClass
  displayName: 'Collection.AskDelete'

  getInitialState: () -> { active: false }

  render: ({authToken, get} = @props) ->

    <Modal widthInPixel='400'>

      <RailsForm name='resource_meta_data' action={get.submit_url}
            method='delete' authToken={authToken}>

        <div className='ui-modal-head'>
          <a href={get.cancel_url} aria-hidden='true'
            className='ui-modal-close' data-dismiss='modal'
            title='Close' type='button'
            style={{position: 'static', float: 'right', paddingTop: '5px'}}>
            <i className='icon-close'></i>
          </a>
          <h3 className='title-l'>{t(get.type_underscore + '_ask_delete_title')}</h3>
        </div>

        <div className='ui-modal-body' style={{maxHeight: 'none'}}>
          <p className="pam by-center">
            {t(get.type_underscore + '_ask_delete_question_pre')}
            <strong>{get.title}</strong>
            {t('resource_ask_delete_question_post')}
          </p>
        </div>

        <div className="ui-modal-footer">
          <div className="ui-actions">
            <a href={get.cancel_url} aria-hidden="true" className="link weak"
              data-dismiss="modal">{t('resource_ask_delete_cancel')}</a>
            <FormButton text={t('resource_ask_delete_ok')}/>
          </div>
        </div>

      </RailsForm>

    </Modal>