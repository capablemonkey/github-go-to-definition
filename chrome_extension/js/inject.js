'use strict';

(function() {
  // Listen for events from background page: context menu click event, defintion results event
  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if (request.sender != "github-ctags-background-page") { return; }
      if (request.message_type == 'tag_query') {
        sendResponse(InfoCollector.info());
      } else if (request.message_type == 'definition_response') {
        console.log(request.found);
        console.log(request.results);
        Modal.create(request.results, InfoCollector.info().mouse.x, InfoCollector.info().mouse.y);
      } else if (request.message_type == 'error') {
        console.error(request.message)
      }
  });

  function setup() {
    InfoCollector.addEventHandlers();

    // Re-add event listeners for right click when we navigate to a new page. This is because Github prevents the page from
    // truly reloading when you navigate to a new page, instead loading the new page in an AJAXy way.
    window.addEventListener('changed_page', function() {
      InfoCollector.addEventHandlers();
    });

    var detector = new URLChangeDetector(window, 500);
  };

  setup();
})()