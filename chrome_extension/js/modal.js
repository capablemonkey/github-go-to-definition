'use strict';

var Modal = (function(){
  var MODAL_ID = 'gh-ctags-definitions-modal';

  var create = function(definitions, locationX, locationY) {
    var modalHolder = generateModal();
    var menuList = modalHolder.find('.select-menu-list');

    definitions.map(function(definition) {
      return generateListItem(definition.url, definition.filename, definition.line_number);
    }).forEach(function(listItem) {
      menuList.append(listItem);
    })

    // add modal to document and show it:
    modalHolder.appendTo('body');
    modalHolder.offset({top: locationY, left: locationX});
    modalHolder.css('position', 'absolute');
    modalHolder.show();
  };

  function generateListItem(url, filename, lineNumber){
    var listItem = $('<a/>', {class: 'select-menu-item js-navigation-item js-navigation-open', href: url + '#L' + lineNumber, target: 'blank', role: 'menuitem', tabindex: 0});
    var listItemDiv = $('<div/>', {class: 'select-menu-item-text'});
    var url = $('<div/>', {class: 'css-truncate css-truncate-target'}).html(filename.slice(40));
    var lineNumber = $('<code/>', {class: 'right'}).html(':' + lineNumber);

    listItemDiv.append(url);
    listItemDiv.append(lineNumber);
    listItem.append(listItemDiv);

    return listItem;
  }

  function generateModal() {
    var modalHolder = $('<div/>', {class: 'select-menu-modal-holder', id: MODAL_ID});
    var modal = $('<div/>', {class: 'select-menu-modal js-menu-content', 'aria-hidden': 'false'})

    modalHolder.append(modal);

    var menuHeader = $('<div/>', {class: 'select-menu-header'});
    var menuTitle = $('<span/>', {class: 'select-menu-title'}).html('Go to definition');

    menuHeader.append(menuTitle);

    modal.append(menuHeader);

    var menuList = $('<div/>', {class: 'select-menu-list js-navigation-container js-active-navigation-container', role: 'menu'});

    modal.append(menuList);

    return modalHolder;
  };

  var destroyOnClick = function(selector) {
    $(selector).on('click', function() {
      $('#' + MODAL_ID).remove();
    });
  };

  return {
    create: create,
    destroyOnClick: destroyOnClick
  }
})();