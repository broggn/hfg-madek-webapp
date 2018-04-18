const React = require('react')
const f = require('active-lodash')
// const cx = require('classnames')
// const t = require('../../../lib/i18n-translate.js')

// const MediaPlayer = require('../../ui-components/MediaPlayer.cjsx')
const MediaEntryPreview = require('../../decorators/MediaEntryPreview.jsx')

const CAPTION_HEIGHT = 55 // absolute heigth of tile caption in pixels

// eslint-disable-next-line react/no-deprecated
module.exports = React.createClass({
  displayName: 'Views.MediaEntryEmbedded',
  propTypes: {
    // eslint-disable-next-line react/no-deprecated
    get: React.PropTypes.shape({
      // eslint-disable-next-line react/no-deprecated
      media_file: React.PropTypes.object.isRequired
    }).isRequired
  },

  render({ get } = this.props) {
    // const { image_url, caption_text, media_type, type, media_file, embed_config } = get
    const { caption_text, media_type, embed_config } = get
    if (!media_type == 'video') throw new Error('only videos supported!')
    // const { previews, original_file_url } = media_file

    // const hasPlayer = media_type == 'audio' || media_type == 'video'

    const defaultSize = {
      width: 500,
      height: media_type == 'audio' ? 200 : 500
    }

    const eWidth = embed_config.width || defaultSize.width
    const eHeight = embed_config.height || defaultSize.height

    const fullsize = {
      height: eHeight - CAPTION_HEIGHT + 'px',
      width: eWidth + 'px'
    }

    let mediaProps
    switch (media_type) {
      case 'image':
      case 'document':
        mediaProps = {
          style: {
            maxWidth: eWidth + 'px',
            maxHeight: eHeight - 1 * CAPTION_HEIGHT + 'px',
            minWidth: '100px',
            minHeight: '100px'
          }
        }
        break
      case 'video':
        mediaProps = f.merge(fullsize, {
          options: {
            fluid: false,
            height: eHeight - CAPTION_HEIGHT,
            width: eWidth
          }
        })
        break
      default:
        mediaProps = fullsize
    }

    return <MediaEntryPreview get={get} mediaProps={mediaProps} captionText={caption_text} />
  }
})
