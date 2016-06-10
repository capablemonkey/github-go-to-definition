$ = jQuery;

var file_url = "";

function getAllCode(){
  all_code = $('.blob-code-inner').text();

  console.log(all_code);

  // in currently hovered blob-code-inner, convert all keywords to spans and add onclick handler to them.
}

getAllCode();

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    sendResponse(extract_info(file_url));
});

$('.file').contextmenu(function(){
  // eg. /mperham/sidekiq/blob/e4d09527c43816706587d86eef3b4036128b465e/lib/sidekiq.rb
  file_url = $(this).find('.file-actions').children('a').attr('href');
});

function extract_info(url) {
  url = url.substr(1); // remove leading /
  var repo_slug = url.split('/blob/')[0];
  var commit_hash = url.split('/blob/')[1];

  commit_hash = commit_hash.substr(0, 40);

  return {
    "repo_slug": repo_slug,
    "commit_hash": commit_hash
  };
}