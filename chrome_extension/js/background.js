function clickHandler(info, tab) {
  var selection = info.selectionText

  chrome.tabs.sendMessage(tab.id, {"selection": selection}, function(response) {
    // ask the content script what the slug is and commit hash...
    console.log(response);
    getDefinitions(selection, response.repo_slug, response.commit_hash);
  })

  // then send API request
  // then display a pop-up to the code.
}

chrome.contextMenus.create({
  "title": "Go to definition",
  "contexts": ["selection"],
  "onclick" : clickHandler
});

function getDefinitions(identifier, repo_slug, commit_hash) {
  $.ajax({
    url: "http://localhost:4567/definition?repo_slug=" + repo_slug + "&commit=" + commit_hash + "&tag=" + identifier
  })
  .done(function(response) {
    response = JSON.parse(response);

    if (response.found === false) {
      console.log('not found');
      return;
    }

    console.dir(response.results);

    var results = response.results;

    chrome.tabs.create({url: results[0].url + "#L" + results[0].line_number});
  });
};