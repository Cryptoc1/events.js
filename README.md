# Events.js

Events.js is a library for managing custom events.


It includes a scheduler for queueing Event Jobs, and a familiar, easy to use API.

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
        console.log('Content was set!')
    })

    // schedule a job for track content change
    Events.scheduler.add(new Job({
        name: 'Demo Change Job',
        event: 'demo-content-set',
        filter: function() {
            if (document.getElementById('demo').textContent === 'Demo content!') return true
        },
        recurring: false
    }))
</script>
```

## Docs
@TODO

### License
MIT

&copy; Samuel Steele <@cryptoc1>
