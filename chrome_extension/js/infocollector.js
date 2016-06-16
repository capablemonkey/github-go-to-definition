'use strict';

var InfoCollector = (function() {
  var info = {
    repo_slug: null,
    commit_hash: null,
    mouse: {
      x: null,
      y: null
    }
  };

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
    info.mouse = {};
    info.mouse.x = clickEvent.clientX;
    info.mouse.y = $(window).scrollTop() + clickEvent.clientY;
  };

  function recordSlugAndCommit(file_url) {
    info = extractInfo(file_url);
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

  function getInfo() {
    return info;
  }

  return {
    addEventHandlers: addEventHandlersForPageLoad,
    'info': getInfo
  };
})();