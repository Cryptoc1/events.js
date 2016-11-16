# Events.js

Events.js is a library for managing custom events.

It includes a built-in scheduler for queueing Event Dispatchers, making it easy and familiar to create custom events.


### Getting Started
Snippet from `demo.html`

```html
<div id="demo"></div>
<script>
    // add some content after 3 seconds
    setTimeout(function() {
        document.getElementById('demo').textContent = 'Demo content!'
    }, 3000)

    // register the listener
    Events.on('demo-content-set', function() {
        window.alert('Content was set! (tick is: ' + Events.scheduler.tick + ')')
    })

    // schedule a job for track content change
    Events.scheduler.add(new EventDispatch({
        name: 'Demo Change Job',
        event: 'demo-content-set',
        filter: function() {
            if (document.getElementById('demo').textContent === 'Demo content!') return true
        },
        timing: {
          hold: 0
        },
        recurring: false
    }))
</script>
```

## Docs
Events.js can be used to manage custom event signaling with an API familiar to those you may have used in JavaScript before.

Events.js API allows you to set as many listeners for a single event, just like `window.addEventListener`.

### API
`Events.on(event, handler)`
+ event : The name of the event to listen to
+ handler : The callback to be called when the event occurs.

Registers a handler for the specified event.
The handler can take any arrangement of arguments (see [`emit`](#emit))

 <a name="emit"></a>`Events.emit(event[, arg1[, arg2[, ...]]])`
+ event : The name of the event to emit
+ params : Arguments to pass to the event handler

Emits the specified event (asynchronously).

Any arguments after `event` will be forwarded to the event handler.


### Scheduler
`Events.scheduler.add(eventDispatch)`
+ eventDispatch : The EventDispatch to add to the scheduler queue

Adds an [EventDispatch](#eventdispatch) to the queue.


### EventDispatch
`new EventDispatch(options)`
+ options : An object defining how the EventDispatch behaves

```javascript
{
    name: String,
    event: String,
    filter: Function,
    timing: {
      tick: Number,
      hold: Number
    },
    recurring: Bool
}
```

+ name : The name of the EventDispatch (default: `event`)
+ event : The event to emit (required)
+ filter : A function that applies logic for emitting the event. When `filter` returns `true`, `event` is emitted by the scheduler.
+ timing : An object that configures when the `filter` should be applied.
    + tick : The scheduler tick to apply `filter` after. (default: `0`)
    + hold : The number of ticks after `tick` to wait before applying `filter`. (default: `0`)
+ recurring : Whether or not `filter` should be applied every `timing.tick + timing.hold` ticks, or only once. (default: `true`)

`event`, and `filter` are required options.

<br>
<br>
For an example of how to use Events.js, see the [demo](https://cryptoc1.github.io/events.js/demo.html)
<br>

<hr>
## License
MIT

&copy; Samuel Steele &lt;@cryptoc1>
