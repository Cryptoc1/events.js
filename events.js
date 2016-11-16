/*
    Job : an object that manages the --execution of a task-- emitting of an event in the scheduler
*/


;(function (undefined) {
  function eventDispatch (opts) {
    if (typeof opts != 'object') throw new Error('opts must be an object!')
    if (!opts['event'] || !opts['filter']) throw new Error('Missing required options')

    this.name = opts['name'] || opts.event
    this.event = opts.event

    this.filter = {
      _once: false,
      invoke: opts.filter
    }

    this.timing = {
      tick: 0,
      hold: 0
    }
    if (opts['timing']) {
      this.timing = {
        tick: opts.timing['tick'] || 0,
        hold: opts.timing['hold'] || 0
      }
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
    delay: 100,
    _eventMap: {},
    _interval: null,
    tick: 0,
    _queue: [],

    // methods
    add: function (job) {
      this._queue.push(job)
    },
    init: function (opts) {
      // ensure everything is cleared out
      if (this._interval != null) {
        window.clearInterval(this._interval)
        this._interval = null

        this._queue = []
        this._eventMap = {}

        this.tick = 0
      }

      var self = this

      this._interval = window.setInterval(function () {
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

        // emit that a new tick occured
        emit('Events.scheduler-tick', {
          tick: self.tick,
          time: Date.now()
        })

        // sync the queue and eventmap
        self._update()
        self.tick++
      }, this.delay)
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
