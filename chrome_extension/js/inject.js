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
      injectDefintionsModal(request.results, window.gh_ctags_data.mouse.x, window.gh_ctags_data.mouse.y);
    } else if (request.message_type == 'error') {
      console.error(request.message)
    }
});

function injectDefintionsModal(definitions, locationX, locationY) {
  var html = '<div class="select-menu-modal-holder" id="gh-ctags-definitions-modal"> <div class="select-menu-modal js-menu-content" aria-hidden="false"> <div class="select-menu-header"> <svg aria-label="Close" class="octicon octicon-x js-menu-close" height="16" role="img" version="1.1" viewBox="0 0 12 16" width="12"><path d="M7.48 8l3.75 3.75-1.48 1.48L6 9.48l-3.75 3.75-1.48-1.48L4.52 8 .77 4.25l1.48-1.48L6 6.52l3.75-3.75 1.48 1.48z"></path></svg> <span class="select-menu-title">Go to definition</span> </div> <div class="select-menu-list js-navigation-container js-active-navigation-container" role="menu"> <a href="/grnhse/greenhouse_io/pull/19/commits/3bd6ac1971ab65750b16c4b0ef96068b3cbf1f25" class="select-menu-item js-navigation-item js-navigation-open" role="menuitem" tabindex="0"> <div class="select-menu-item-text"> <code class="right">3bd6ac1</code> <div class="text-emphasized css-truncate css-truncate-target"> add support for creating notes using Harvest API </div> <span class="description"> jleven <relative-time datetime="2016-04-18T19:30:31Z" title="Apr 18, 2016, 3:30 PM EDT">on Apr 18</relative-time> </span> </div> </a> <a href="/grnhse/greenhouse_io/pull/19/commits/ba1bec9f0f7de8867acbbf951ac36a65c7abab50" class="select-menu-item js-navigation-item js-navigation-open" role="menuitem" tabindex="0"> <div class="select-menu-item-text"> <code class="right">ba1bec9</code> <div class="text-emphasized css-truncate css-truncate-target"> Refactor post_to_harvest_api to be more general </div> <span class="description"> capablemonkey <relative-time datetime="2016-04-20T15:41:41Z" title="Apr 20, 2016, 11:41 AM EDT">on Apr 20</relative-time> </span> </div> </a> </div> </div></div>';
  var modal = $(html).appendTo('body');
  modal.offset({top: locationY, left: locationX});
  modal.css('position', 'absolute');
  modal.show();
}

// Add event handler for right clicking in .file containers
function listenForRightClick() {
  $('.file').contextmenu(function(e){
    // eg. /mperham/sidekiq/blob/e4d09527c43816706587d86eef3b4036128b465e/lib/sidekiq.rb
    var file_url = $(this).find('.file-actions').children('a').attr('href');
    window.gh_ctags_data = extractInfo(file_url);
    window.gh_ctags_data.mouse = {};
    window.gh_ctags_data.mouse.x = e.clientX;
    window.gh_ctags_data.mouse.y = $(window).scrollTop() + e.clientY;
  });
};

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

function URLChangeDetector(window, interval_ms) {
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
}

function setup() {
  listenForRightClick();

  // Re-add event listeners for right click when we navigate to a new page. This is because Github prevents the page from
  // truly reloading when you navigate to a new page, instead loading the new page in an AJAXy way.
  window.addEventListener('changed_page', function() {
    listenForRightClick();
  });

  var detector = new URLChangeDetector(window, 500);
};

setup();