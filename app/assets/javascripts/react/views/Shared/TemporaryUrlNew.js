import React from 'react'
import f from 'lodash'
import ui from '../../lib/ui.coffee'
import UI from '../../ui-components/index.coffee'
import RailsForm from '../../lib/forms/rails-form.cjsx'
const t = ui.t

class TemporaryUrlNew extends React.Component {
  render(props = this.props) {
    const action = f.get(props, 'get.actions.create')
    if (!action) return false

    const textAreaStyle = {
      minHeight: 'initial',
      resize: 'vertical'
    }

    return (
      <div
        className="by-center"
        style={{ marginLeft: 'auto', marginRight: 'auto' }}
      >
        <div
          className="ui-container bright bordered rounded mal phm pbm"
          style={{ display: 'inline-block', minWidth: '420px' }}
        >
          <RailsForm
            name="temporary_url"
            method={action.method}
            action={action.url}
            authToken={props.authToken}
          >
            <div className="ui-form-group rowed prn pbs">
              <h3 className="title-l">{t('temporary_urls_create_title')}</h3>
            </div>
            <div className="ui-form-group rowed pan ">
              <label className="form-label">
                {t('temporary_urls_create_description')}
                <textarea
                  className="form-item block"
                  style={textAreaStyle}
                  name={'temporary_url[description]'}
                  rows="3"
                />
              </label>
            </div>
            <div className="ui-actions mtm">
              <UI.Button type="submit" className="primary-button">
                {t('temporary_urls_create_submit')}
              </UI.Button>
              <UI.Button href={action.url} className="button">
                {t('temporary_urls_create_cancel')}
              </UI.Button>
            </div>
          </RailsForm>
        </div>
      </div>
    )
  }
}

module.exports = TemporaryUrlNew
