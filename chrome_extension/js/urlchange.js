'use strict';

var URLChangeDetector = function(window, intervalMS) {
  function currentURL() { return window.location.pathname; }

  var event = new Event('changed_page');
  var previousURL = currentURL();

  function monitor() {
    if (previousURL != currentURL()) {
      window.dispatchEvent(event);
      previousURL = currentURL();
    }
  }

  this.timer = setInterval(monitor, intervalMS);
};