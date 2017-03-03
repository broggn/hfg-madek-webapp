import React from 'react'
import videojs from 'video.js'
import cx from 'classnames'
import omit from 'lodash/omit'
import merge from 'lodash/merge'
/* eslint-disable camelcase */ // props from server

const noop = () => {}

const DEFAULT_OPTIONS = {
  fluid: true,
  controlBar: {
    children: [
      'playToggle',
      'currentTimeDisplay',
      'timeDivider',
      'durationDisplay',
      'progressControl',
      'liveDisplay',
      'remainingTimeDisplay',
      'customControlSpacer',
      'muteToggle',
      'volumeControl',
      'playbackRateMenuButton',
      'chaptersButton',
      'descriptionsButton',
      'subtitlesButton',
      'captionsButton',
      'audioTrackButton',
      'fullscreenToggle'
    ]
  }
}


// react wrapper

class VideoJS extends React.Component {
  componentDidMount () {
    if (!this.videoNode) throw new Error('no video tag!')

    const playerOptions = merge(DEFAULT_OPTIONS, this.props.options)
    // init:
    this.player = videojs(this.videoNode, playerOptions, this.props.onPlayerReady)
  }

  // destroy player on unmount
  componentWillUnmount () {
    if (this.player) {
      this.player.dispose()
    }
  }

  render ({props, state} = this) {
    const {sources, ...restProps} = props
    const videoProps = omit(restProps, 'options')

    const classes = cx(this.props.className, 'videojs video-js video-fluid vjs-default-skin')

    // NOTE: wrap the player in a div with a `data-vjs-player` attribute so videojs won't create additional wrapper in the DOM
    return (<div data-vjs-player>
      <video ref='video' {...videoProps} className={classes}>
        {sources.map(({url, content_type}) =>
          <source src={url} type={content_type} key={`${url}${content_type}`} />
        )}
      </video>
    </div>)
  }
}

VideoJS.defaultProps = {
  controls: true,
  preload: 'auto',
  onPlayerReady: noop
}

export default VideoJS
