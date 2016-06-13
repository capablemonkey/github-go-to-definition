'use strict';

var URLChangeDetector = function(window, interval_ms) {
  function currentURL() { return window.location.pathname; }

  var event = new Event('changed_page');
  var previous_url = currentURL();

  function monitor() {
    if (previous_url != currentURL()) {
      window.dispatchEvent(event);
      previous_url = currentURL();
    }
  }

  this.timer = setInterval(monitor, interval_ms);
};