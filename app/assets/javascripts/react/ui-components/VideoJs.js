import React from 'react'
import videojs from 'video.js'
import cx from 'classnames'
import merge from 'lodash/merge'
import omit from 'lodash/omit'
/* eslint-disable camelcase */ // props from server

// videojs.registerPlugin('videoJsResolutionSwitcher', VideoJsResolutionSwitcher)

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
  },
  plugins: {
    hdToggle: { HD: false },
    videoJsResolutionSwitcher: {
      ui: true,
      default: 'auto', // Default resolution [{Number}, 'low', 'high'],
      dynamicLabel: true // Display dynamic labels or gear symbol
    }
  }
}

// plugins

const Plugin = videojs.getPlugin('plugin')

class HdToggle extends Plugin {

  constructor (player, options) {
    super(player, options)

    // debugger
    // QualityLevelList.addQualityLevel({
    //   id: 'string',
    //   width: 'number',
    //   height: 'number',
    //   bitrate: 'number',
    //   enabled: (toggle) => (toggle !== undefined) ? toggle : true || false
    // })

    if (options.customClass) {
      player.addClass(options.customClass)
    }

    player.on('playing', () => {
      videojs.log('playback began!')
    })
  }

  dispose () {
    super.dispose()
    videojs.log('the HdToggle plugin is being disposed')
  }

  updateState () {
    this.setState({playing: !this.player.paused()})
  }

  logState (changed) {
    videojs.log(`the player is now ${this.state.playing ? 'playing' : 'paused'}`)
  }

}

HdToggle.defaultState = { HD: false }

videojs.registerPlugin('hdToggle', HdToggle)


// react wrapper

class VideoJS extends React.Component {
  componentDidMount () {
    if (!this.videoNode) throw new Error('no video tag!')

    const playerOptions = merge(DEFAULT_OPTIONS, this.props.options)

    // init:
    this.player = videojs(this.videoNode, playerOptions, this.props.onPlayerReady)
    this.player.updateSrc([
      {
        src: 'https://vjs.zencdn.net/v/oceans.mp4?sd',
        type: 'video/mp4',
        label: 'SD',
        res: 360
      },
      {
        src: 'https://vjs.zencdn.net/v/oceans.mp4?hd',
        type: 'video/mp4',
        label: 'HD',
        res: 720
      }
    ])
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
      <video
        {...videoProps}
        className={classes}
        ref={(node) => { this.videoNode = node }}
      >
        {sources.map(({url, content_type, profile}) =>
          <source
            src={url}
            type={content_type}
            key={profile + content_type + url}
          />
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
