/*
    Job : an object that manages the --execution of a task-- emitting of an event in the scheduler
*/


;(function (undefined) {
  function eventDispatch (opts) {
    if (typeof opts != 'object') throw new Error('opts must be an object!')
    if (!opts['event'] || !opts['filter']) throw new Error('Missing required options')

    this.name = opts['name']
    this.event = opts.event

    this.filter = {
      _once: false,
      invoke: opts.filter
    }

    this.timing = {
      hold: opts['timing']['hold'] || 0
    }

    this.recurring = (opts['recurring'] != undefined) ? opts.recurring : true
  }

  window.EventDispatch = eventDispatch
})(undefined)

/*
    Events : used for managing custom events. Shocker, right?
*/


;(function (events, undefined) {
  var _listeners = {}

  var scheduler = {
    // properties
    _delay: 100,
    _eventMap: {},
    _interval: null,
    tick: 0,
    _queue: [],

    // methods
    add: function (job) {
      this._queue.push(job)
    },
    init: function (opts) {
      var self = this

      // mask the warning
      on('Events.scheduler-tick', function () {})

      this._interval = setInterval(function () {
        // iterate through our jobs and invoke filters as needed
        for (var event in self._eventMap) {
          self._eventMap[event].map(function (eventDispatch) {
            if (self.tick > eventDispatch.timing.tick + eventDispatch.timing.hold) {
              if (!eventDispatch.filter._once) {
                if (eventDispatch.filter.invoke() == true) {
                  emit(eventDispatch.event)
                  eventDispatch.filter._once = true
                }
              } else {
                if (eventDispatch.recurring === true) {
                  if (eventDispatch.filter.invoke() == true) {
                    emit(eventDispatch.event)
                  }
                }
              }
              eventDispatch.timing.tick = self.tick
            }
          })
        }

        // update the queue and eventmap every tick
        self._update()
        self.tick++

        emit('Events.scheduler-tick', {
          tick: self.tick
        })
      }, this._delay)
    },
    _update: function () {
      var self = this
      if (this._queue.length > 0) {
        this._queue.map(function (eventDispatch) {
          // define the event if needed
          if (!self._eventMap.hasOwnProperty(eventDispatch.event)) {
            self._eventMap[eventDispatch.event] = []
          }

          // set when the queue touched the eventDispatch
          eventDispatch.timing['tick'] = self.tick

          self._eventMap[eventDispatch.event].push(eventDispatch)
        })

        // clear the queue
        this._queue = []
      }
    }

  }

  function on (e, cb) {
    if (!_listeners.hasOwnProperty(e)) _listeners[e] = []
    _listeners[e].push(cb)
  }

  function emit (e) {
    if (!_listeners.hasOwnProperty(e)) {
      // console.warn('Events.js: event "' + e + '" has no registered listeners.')
    } else {
      var args = Array.prototype.slice.call(arguments)
      args.splice(0, 1)

      _listeners[e].map(function (cb) {
        setTimeout(function () {
          // we use a timeout to make the call async, because we don't have to wait for cb to return
          cb.apply(null, args)
        }, 0)
      })
    }
  }

  events.scheduler = scheduler
  events.scheduler.init()

  // public
  events.on = on
  events.emit = emit

  window.Events = events
})(window.Events || {}, undefined)


;(function (undefined) {

  // register high-level events
  window.addEventListener('load', function (e) {
    Events.emit('load', e)
  })

  window.addEventListener('resize', function (e) {
    Events.emit('resize', e)
  })

  window.addEventListener('click', function (e) {
    Events.emit('click', e)
  })
})(undefined)