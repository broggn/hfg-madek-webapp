# FIXME: move to decorators
React = require('react')
f = require('active-lodash')
t = require('../../lib/string-translation.js')('de')

AudioPlayer = require('./AudioPlayer').default
VideoPlayer = require('./VideoPlayer').default

module.exports = React.createClass
  displayName: 'MediaPlayer'
  propTypes:
    type: React.PropTypes.oneOf(['audio', 'video']).isRequired
    sources: React.PropTypes.arrayOf(
      React.PropTypes.shape({
        url: React.PropTypes.string.isRequired,
        content_type: React.PropTypes.string.isRequired
      }).isRequired).isRequired
    poster: React.PropTypes.string

  getInitialState: () -> { active: false, showHint: false }
  componentDidMount: ()->
    @setState(active: true)

  _ref: (ref) ->
    return unless ref
    maybes = f.filter @props.sources, (source) ->
      ref.canPlayType(source.content_type) != ''

    if f.isEmpty(maybes)
      @setState({showHint: true})

  render: ({type, sources, poster} = @props)->
    MediaTag = type

    # FIXME: move error handling to AudioPlayer
    if type == 'audio'
      <AudioPlayer sources={sources} />
    else
      # use videojs for client-side videos
      # before the player is loaded, show the poster to minimize flicker
      # if js fails, user still get the HTML5 video tag
      videoProps = f.omit(@props, 'originalUrl')
      if !@state.active
        <div>
          <div className='no-js'>
            <VideoPlayer {...videoProps} />
          </div>
          <div className='js-only'>
            <img src={poster} style={{height: '100%', width: '100%'}}/>
          </div>
        </div>
      else
        <VideoPlayer {...videoProps} />
