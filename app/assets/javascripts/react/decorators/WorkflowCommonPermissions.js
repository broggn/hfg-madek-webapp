import React from 'react'
import f from 'lodash'
import cx from 'classnames'
import TagCloud from '../ui-components/TagCloud.cjsx'
import I18nTranslate from '../../lib/i18n-translate'
import labelize from '../../lib/labelize'

const UI_TXT = {
  common_settings_permissions_title: { de: 'Berechtigungen', en: 'Permissions' },
  common_settings_permissions_responsible: { de: 'Verantwortlich', en: 'Responsible' },
  common_settings_permissions_write: { de: 'Schreib- und Leserechte', en: 'Read and write rights' },
  common_settings_permissions_read: { de: 'Nur Leserechte', en: 'Only reading rights' },
  common_settings_permissions_read_public: { de: 'Öffentlicher Zugriff', en: 'Public access' }
}

const t = key => {
  /* global APP_CONFIG */
  // FIXME: only works client-side for now, hardcode a fallback…
  const locale = f.get(APP_CONFIG, 'userLanguage') || 'de'
  return f.get(UI_TXT, [key, locale]) || I18nTranslate(key)
}

export default class WorkflowCommonPermissions extends React.Component {
  render() {
    const { responsible, write, read, read_public } = this.props.permissions
    const { showHeader } = this.props
    const supHeadStyle = { textTransform: 'uppercase', fontSize: '85%', letterSpacing: '0.15em' }

    return (
      <div>
        {showHeader &&
          <span style={supHeadStyle}>{t('common_settings_permissions_title')}</span>
        }
        <ul>
          <li>
            <span className="title-s">{t('common_settings_permissions_responsible')}: </span>
            {!!responsible && (
              <TagCloud
                mod="person"
                mods="small inline"
                list={labelize([responsible])}
              />
            )}
          </li>
          <li>
            <span className="title-s">
              {t('common_settings_permissions_write')}
              {': '}
            </span>
            <TagCloud
              mod="person"
              mods="small inline"
              list={labelize(write)}
            />
          </li>
          <li>
            <span className="title-s">
              {t('common_settings_permissions_read')}
              {': '}
            </span>
            <TagCloud
              mod="person"
              mods="small inline"
              list={labelize(read)}
            />
          </li>
          <li>
            <span className="title-s">
              {t('common_settings_permissions_read_public')}
              {': '}
            </span>
            {read_public ? (
              <i className="icon-checkmark" title="Ja" />
            ) : (
              <i className="icon-close" title="Nein" />
            )}
          </li>
        </ul>
      </div>
    )
  }
}

WorkflowCommonPermissions.defaultProps = {
  showHeader: false
}
