'use strict';

(function() {
  window.gh_ctags_data = {
    repo_slug: null,
    commit_hash: null,
    mouse: {
      x: null,
      y: null
    }
  };

  // Listen for events from background page: context menu click event, defintion results event
  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if (request.sender != "github-ctags-background-page") { return; }
      if (request.message_type == 'tag_query') {
        sendResponse(window.gh_ctags_data);
      } else if (request.message_type == 'definition_response') {
        console.log(request.found);
        console.log(request.results);
        Modal.create(request.results, window.gh_ctags_data.mouse.x, window.gh_ctags_data.mouse.y);
      } else if (request.message_type == 'error') {
        console.error(request.message)
      }
  });

  function addEventHandlersForPageLoad() {
    // detect the kind of page we're on
    // if this is a single file view, we can rely on the .repository-content url
    var singleFileView = $('.file').length === 1;

    if (singleFileView) {
      eventHandlerForSingleFileView();
    } else {
      // otherwise, we might be in a pull request or commit view:
      eventHandlerForMultipleFileView();
    }

    // Kill any existing modal when we click elsewhere in file view:
    Modal.destroyOnClick('.file');

    function eventHandlerForMultipleFileView() {
      $('.file').contextmenu(function(clickEvent){
        // eg. /mperham/sidekiq/blob/e4d09527c43816706587d86eef3b4036128b465e/lib/sidekiq.rb
        var fileURL = $(this).find('.file-actions').children('a').attr('href');
        recordSlugAndCommit(fileURL);
        recordMouse(clickEvent);
      });
    };

    function eventHandlerForSingleFileView() {
      $('.file').contextmenu(function(clickEvent){
        // eg. /mperham/sidekiq/blob/e4d09527c43816706587d86eef3b4036128b465e/lib/sidekiq.rb
        var fileURL = $('.repository-content > .js-permalink-shortcut').first().attr('href');
        recordSlugAndCommit(fileURL);
        recordMouse(clickEvent);
      });
    }
  };

  function recordMouse(clickEvent) {
    window.gh_ctags_data.mouse = {};
    window.gh_ctags_data.mouse.x = clickEvent.clientX;
    window.gh_ctags_data.mouse.y = $(window).scrollTop() + clickEvent.clientY;
  };

  function recordSlugAndCommit(file_url) {
    window.gh_ctags_data = extractInfo(file_url);
  }

  // Extract repo slug and commit hash from file URL.
  function extractInfo(url) {
    url = url.substr(1); // remove leading /
    var repo_slug = url.split('/blob/')[0];
    var commit_hash = url.split('/blob/')[1];

    commit_hash = commit_hash.substr(0, 40);

    return {
      "repo_slug": repo_slug,
      "commit_hash": commit_hash
    };
  };

  function setup() {
    addEventHandlersForPageLoad();

    // Re-add event listeners for right click when we navigate to a new page. This is because Github prevents the page from
    // truly reloading when you navigate to a new page, instead loading the new page in an AJAXy way.
    window.addEventListener('changed_page', function() {
      addEventHandlersForPageLoad();
    });

    var detector = new URLChangeDetector(window, 500);
  };

  setup();
})()