(function() {
  $(function() {
    var client, copyButton, currentMonth, currentYear, defaultItemList, doEmptyButton, doNotEmptyButton, doNotRestoreButton, doRestoreButton, emptyItemsButton, focusOnItemsField, generateTaskPaperMonth, hideEmptyItemsButton, hideEmptyItemsDialog, hideRestoreDefaultsDialog, items, itemsField, month, nextYear, restoreDefaultItemsButton, restoreDefaultsToItemsField, showEmptyItemsButton, showEmptyItemsDialog, showRestoreDefaultsDialog, thisYear, today, url, year;
    defaultItemList = '1\nto-do item\n\n14\nanother task\n\tnotes\n\n29\ntask\nyet another task\n\tnotes and details\n\tanother note';
    if (localStorage.getItem('items')) {
      items = localStorage.getItem('items');
      year = localStorage.getItem('year');
      month = localStorage.getItem('month');
    } else {
      today = new Date();
      items = defaultItemList;
      year = today.getFullYear();
      month = today.getMonth();
    }
    url = $.url();
    if (url.param('year') != null) {
      year = url.param('year');
    }
    if (url.param('month') != null) {
      month = url.param('month');
    }
    itemsField = $('#items');
    focusOnItemsField = function() {
      return itemsField.focus();
    };
    thisYear = new Date().getFullYear();
    nextYear = thisYear + 1;
    $('#year-this').attr('id', 'year-' + thisYear).attr('value', thisYear).after($('<label for="year-' + thisYear + '">' + thisYear + '</label>'));
    $('#year-next').attr('id', 'year-' + nextYear).attr('value', nextYear).after($('<label for="year-' + nextYear + '">' + nextYear + '</label>'));
    $('#year-' + year).attr('checked', true);
    $('#month-' + month).attr('checked', true);
    currentMonth = new Date().getMonth() + 1;
    currentYear = new Date().getFullYear();
    $('#month-' + currentMonth).addClass('current-month');
    $('#year-' + currentYear).addClass('current-year');
    itemsField.val(items);
    focusOnItemsField();
    (generateTaskPaperMonth = function() {
      var cleanURL, day, dayName, dayNames, dayNumber, generatedMonth, itemsArray, nextMonth, numberOfDays, selectedMonth, selectedYear, _i;
      selectedYear = $('input[name="year"]:checked');
      selectedMonth = $('input[name="month"]:checked');
      year = selectedYear.val();
      month = selectedMonth.val() - 1;
      numberOfDays = new Date(year, month, 0).getDate() + 1;
      generatedMonth = '';
      itemsArray = itemsField.val().split(/(\d+):?\n/m);
      itemsArray.shift();
      items = {};
      $.each(itemsArray, function(key, value) {
        if (key % 2 === 0) {
          return items[itemsArray[key]] = itemsArray[key + 1];
        }
      });
      $.each(items, function(key, value) {
        return items[key] = items[key].trim().split('\n');
      });
      for (day = _i = 1; 1 <= numberOfDays ? _i <= numberOfDays : _i >= numberOfDays; day = 1 <= numberOfDays ? ++_i : --_i) {
        dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        dayName = dayNames[new Date(year, month, day).getDay()];
        dayNumber = day;
        if (dayNumber > 1) {
          generatedMonth += '\n';
        }
        if (dayNumber < 10) {
          generatedMonth += '0';
        }
        generatedMonth += dayNumber + ' ' + dayName + ':';
        if (items[dayNumber]) {
          $.each(items[dayNumber], function(key, value) {
            if (value.substring(0, 2) === '  ' || value.substring(0, 1) === '\t') {
              return generatedMonth += '\n\t' + value;
            } else if (value.substring(0, 2) === '- ') {
              return generatedMonth += '\n\t' + value;
            } else {
              return generatedMonth += '\n\t- ' + value;
            }
          });
        }
        nextMonth = {};
        if (month === 11) {
          nextMonth['month'] = 1;
          nextMonth['year'] = Number(year) + 1;
        } else {
          nextMonth['month'] = Number(month) + 2;
          nextMonth['year'] = year;
        }
        if (dayNumber === numberOfDays) {
          generatedMonth += '\n\t- generate new Taskpaper month\n\t\thttp://matthewmcvickar.github.io/taskpaper-month-generator?year=' + nextMonth['year'] + '&month=' + nextMonth['month'];
        }
      }
      $('#taskpaper-month').val(generatedMonth);
      cleanURL = window.location.href.substring(0, window.location.href.indexOf('?')) + '?year=' + year + '&month=' + (Number(month) + 1);
      history.pushState({}, '', cleanURL);
      localStorage.setItem('year', selectedYear.val());
      localStorage.setItem('month', selectedMonth.val());
      return localStorage.setItem('items', itemsField.val());
    })();
    $('input[name="month"]').on('change', generateTaskPaperMonth);
    $('input[name="year"]').on('change', generateTaskPaperMonth);
    itemsField.on('keyup', $.debounce(250, generateTaskPaperMonth));
    itemsField.keydown(function(key) {
      var cursorPosition;
      cursorPosition = itemsField.get(0).selectionStart;
      if (key.keyCode === 9) {
        key.preventDefault();
        itemsField.val(itemsField.val().slice(0, cursorPosition) + '\t' + itemsField.val().slice(cursorPosition));
        itemsField.get(0).setSelectionRange(cursorPosition + 1, cursorPosition + 1);
        return false;
      }
    });
    emptyItemsButton = $('#empty-items-button');
    doEmptyButton = $('#do-empty');
    doNotEmptyButton = $('#do-not-empty');
    showEmptyItemsButton = function() {
      return emptyItemsButton.fadeIn('fast');
    };
    hideEmptyItemsButton = function() {
      return emptyItemsButton.fadeOut('fast');
    };
    showEmptyItemsDialog = function() {
      return $('#empty-items-dialog').fadeIn('fast');
    };
    hideEmptyItemsDialog = function() {
      return $('#empty-items-dialog').fadeOut('fast');
    };
    restoreDefaultItemsButton = $('#restore-default-items-button');
    doRestoreButton = $('#do-restore');
    doNotRestoreButton = $('#do-not-restore');
    showRestoreDefaultsDialog = function() {
      return $('#restore-default-items-dialog').fadeIn('fast');
    };
    hideRestoreDefaultsDialog = function() {
      return $('#restore-default-items-dialog').fadeOut('fast');
    };
    restoreDefaultsToItemsField = function() {
      itemsField.val(defaultItemList);
      return focusOnItemsField();
    };
    restoreDefaultItemsButton.click(function() {
      if (itemsField.val().trim() !== '') {
        showRestoreDefaultsDialog();
        hideEmptyItemsDialog();
        return focusOnItemsField();
      } else {
        showEmptyItemsButton();
        restoreDefaultsToItemsField();
        return focusOnItemsField();
      }
    });
    doNotRestoreButton.click(function() {
      hideRestoreDefaultsDialog();
      return focusOnItemsField();
    });
    doRestoreButton.click(function() {
      hideRestoreDefaultsDialog();
      showEmptyItemsButton();
      restoreDefaultsToItemsField();
      return focusOnItemsField();
    });
    emptyItemsButton.click(function() {
      hideRestoreDefaultsDialog();
      showEmptyItemsDialog();
      return focusOnItemsField();
    });
    doNotEmptyButton.click(function() {
      hideEmptyItemsDialog();
      return focusOnItemsField();
    });
    doEmptyButton.click(function() {
      hideEmptyItemsDialog();
      hideEmptyItemsButton();
      itemsField.val('');
      return focusOnItemsField();
    });
    itemsField.on('keyup', function() {
      if (itemsField.val().trim() !== '') {
        return showEmptyItemsButton();
      } else {
        return hideEmptyItemsButton();
      }
    });
    copyButton = $('#copy-button');
    ZeroClipboard.config({
      moviePath: 'js/lib/ZeroClipboard.swf'
    });
    client = new ZeroClipboard(copyButton);
    client.on('load', function(client) {
      return client.on('datarequested', function(client) {
        return client.setText($('#taskpaper-month').val());
      });
    });
    client.on('noFlash', function() {
      copyButton.hide();
      return console.error('No Flash installed. Hiding the \'Copy\' button.');
    });
    return client.on('wrongFlash', function() {
      copyButton.hide();
      return console.error('Wrong version of Flash installed. Hiding the \'Copy\' button.');
    });
  });

}).call(this);

//# sourceMappingURL=script.js.map
