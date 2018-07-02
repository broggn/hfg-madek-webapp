import __ from 'lodash'


var fireTreeEvent2 = function(eventTree, componentPath, componentId, event) {


  var path = componentPath
  var newEventTree = eventTree
  var current = newEventTree
  for(var i = 0; i < path.length; i++) {
    var pi = path[i]

    if(Array.isArray(pi)) {

      if(!current.children[pi[0]]) {
        current.children[pi[0]] = {
          isArray: true,
          arrYyy: []
        }
      }

      if(!current.children[pi[0]].arrYyy[pi[1]]) {
        current.children[pi[0]].arrYyy[pi[1]] = {
          children: {},
          event: null,
        }
      }
      current = current.children[pi[0]].arrYyy[pi[1]]


    } else {
      if(!current.children[pi]) {
        current.children[pi] = {
          children: {},
          event: null,
          isArray: false
        }
      }
      current = current.children[pi]
    }

  }
  current.event = event
  current.componentId = componentId
  return newEventTree
}














var nextId = 0

var compactObject = function(o) {
  return __.fromPairs(
    __.compact(
      __.map(o, function(v, k) {
        return !v ? null : [k, v]
      })
    )
  )
}

var build = function(definition, last, rootTrigger, rootEventTree, merged) {

  if(last && !verifyEventId2(last, rootEventTree)) {
    console.log('not valid tree anymore ' + JSON.stringify(rootEventTree))
    return last
  }

  // console.log(JSON.stringify(rootEventTree, null, '  '))
  return reduceComponent(definition, last, rootTrigger, rootEventTree, [], merged)
};




var verifyEventId2 = function(llast, leventTree) {

  var verifyRec = function(last, eventTree) {

    if(eventTree.componentId != undefined) {
      if(eventTree.componentId != last.id) {
        return false
      }
    }

    for(var c in eventTree.children) {
      var childTree = eventTree.children[c]
      var childLast = last.component.components[c]

      if(!childLast) {
        return false
      }

      if(childTree.isArray) {
        // debugger
        for(var i in childTree.arrYyy) {

          if(!childLast[i]) {
            return false
          }

          if(!verifyRec(childLast[i], childTree.arrYyy[i])) {
            return false
          }
        }



      } else {

        if(!verifyRec(childLast, childTree)) {
          return false
        }

      }


    }

    return true

  }
  return verifyRec(llast, leventTree)
}


var reduceComponent = function(definition, last, rootTrigger, eventTree, path, merged) {

  var cid = null

  if(last && !definition.reset) {
    cid = last.id
  } else {
    cid = nextId
    nextId++
  }

  var reduceResult = buildComponent2(cid, definition, (last && !definition.reset ? last : null), rootTrigger, eventTree, path, merged)

  var r = {
    component: reduceResult,
    id: cid,
    path: path,
    dangerousProps: definition.props
  }
  return r
}


var buildChildren2 = function(next, last, rootTrigger, eventTree, path, merged) {

  if(!next.components) {
    return null
  }


  return compactObject(__.mapValues(next.components, function(v, k) {

    if(!v) {
      return null
    }

    if(Array.isArray(v)) {

      return __.map(
        v,
        function(vi, i) {
          var lastChild = last && last.component.components[k] && i < last.component.components[k].length ? last.component.components[k][i] : null
          var childPath = __.concat(path, [[k, i]])
          return reduceComponent(
            vi, lastChild, rootTrigger, (eventTree && eventTree.children[k] ? eventTree.children[k].arrYyy[i] : null), childPath,
            merged.components[k] && i < merged.components[k].length ? merged.components[k][i] : {
              data: {},
              components: {},
              props: {},
              event: {}
            }
          )
        }
      )
    }
    else {
      var lastChild = last ? last.component.components[k] : null
      var childPath = __.concat(path, k)
      return reduceComponent(
        v, lastChild, rootTrigger, (eventTree ? eventTree.children[k] : null), childPath,
        merged.components[k]
      )
    }
  }))
}


var buildComponent2 = function(id, def, last, rootTrigger, eventTree, path, merged) {

  var info = {
    trigger: function(event) {

      var newEventTree = {
        componentId: 0,
        event: {},
        children: {}
      }

      var newEventTree = fireTreeEvent2(newEventTree, path, id, event)

      rootTrigger(newEventTree)
    }
  }


  var prettyState = (n, eventTree) => {
    if(!n) return null
    if(Array.isArray(n)) {
      return __.map(n, (ni, i) => {
        return prettyState(ni, (eventTree ? eventTree.arrYyy[i] : null))
      })
    } else {
      return {
        props: n.dangerousProps,
        data: n.component.data,
        components: __.mapValues(n.component.components, (c, k) => {
          return prettyState(c, (eventTree ? eventTree.children[k] : null))
        }),
        event: (eventTree ? eventTree.event : {})
      }
    }
  }

  var prettyEvent = (n) => {
    if(!n) return null
    if(n.isArray) {
      return __.map(n.arrYyy, (ni) => prettyEvent(ni))
    } else {
      return {
        event: n.event,
        components: __.mapValues(n.children, (e) => prettyEvent(e))
      }
    }
  }

  merged.initial = !last

  var next = def.reduce(
    {
      last: prettyState(last, eventTree),
      event: prettyEvent(eventTree),
      props: def.props
    },
    (e) => info.trigger(e),
    merged
  )

  return {
    data: next.data,
    components:  buildChildren2(next, last, rootTrigger, eventTree, path, merged),
    props: def.props
  }

};


var mergeStateAndEvents = function(lastState, eventTree) {

  if(!lastState) {
    return {
      data: {},
      components: {},
      props: {},
      event: {}
    }
  } else {
    return {
      data: (lastState.component.data ? lastState.component.data : {}),
      components: compactObject(
        __.mapValues(
          lastState.component.components,


          function(v, k) {

            if(!v) {
              return null
            }

            if(Array.isArray(v)) {

              return __.map(
                v,
                function(vi, i) {
                  var lastChild = lastState && lastState.component.components[k] && i < lastState.component.components[k].length ? lastState.component.components[k][i] : null
                  return mergeStateAndEvents(
                    lastChild,
                    (eventTree && eventTree.children[k] ? eventTree.children[k].arrYyy[i] : null)
                  )
                  // var childPath = __.concat(path, [[k, i]])
                  // return reduceComponent(vi, lastChild, rootTrigger, (eventTree && eventTree.children[k] ? eventTree.children[k].arrYyy[i] : null), childPath)
                }
              )
            }
            else {
              return mergeStateAndEvents(
                lastState.component.components[k],
                (eventTree ? eventTree.children[k] : null)
              )
              // // var lastChild = lastState ? lastState.component.components[k] : null
              // var childPath = __.concat(path, k)
              // return reduceComponent(v, lastChild, rootTrigger, (eventTree ? eventTree.children[k] : null), childPath)
            }
          }




        )
      ),
      props: (lastState.component.props ? lastState.component.props : {}),
      event: (eventTree ? eventTree.event : {})
    }
  }

  return null
}


module.exports = {

  build: function(stateReduction, lastState, eventTree, trigger) {

    var merged = mergeStateAndEvents(lastState, eventTree)

    return build(stateReduction, lastState, trigger, eventTree, merged);
  },

  prettyState: function(state, rootTrigger) {

    var prettyState = (n) => {
      if(!n) return null
      if(Array.isArray(n)) {
        return __.map(n, (ni) => prettyState(ni))
      } else {
        return {
          props: n.dangerousProps,
          data: n.component.data,
          components: __.mapValues(n.component.components, (c) => prettyState(c)),
          trigger: (event) => {
            var newEventTree = {
              componentId: 0,
              event: {},
              children: {}
            }
            var newEventTree = fireTreeEvent2(newEventTree, n.path, n.id, event)
            rootTrigger(newEventTree)
          }
        }
      }
    }

    return prettyState(state)
  }
}
