jQuery(function($) {

  // Load the year, month, and items values from localStorage, or get the
  // current year and month and the default item set.
  var defaultItemList = '1\nto-do item\n\n14\nanother task\n\tnotes\n\n29\ntask\nyet another task\n\tnotes and details\n\tanother note',
      items,
      year,
      month,
      itemsField = $('#items'),
      thisYear   = moment().year(),
      nextYear   = thisYear + 1;

  if (localStorage.getItem('TaskPaperMonthGenerator_items')) {
    items = localStorage.getItem('TaskPaperMonthGenerator_items');
    year = localStorage.getItem('TaskPaperMonthGenerator_year');
    month = localStorage.getItem('TaskPaperMonthGenerator_month');
  } else {
    items = defaultItemList;
    year = moment().year();
    month = moment().month() + 1;
  }

  // Replace saved values with URL parameters, if they exist.
  if (URI().hasQuery('year') && URI().search(true).year === !'undefined') {
    year = URI().search(true).year;
  }
  if (URI().hasQuery('month') && typeof URI().search(true).month === !'undefined') {
    month = URI().search(true).month;
  }

  // Initial Setup Steps:

  // 1. Populate year buttons with current and next year.
  $('#year-this')
    .attr('id', 'year-' + thisYear)
    .attr('value', thisYear)
    .after($('<label for="year-' + thisYear + '">' + thisYear + '</label>'));

  $('#year-next')
    .attr('id', 'year-' + nextYear)
    .attr('value', nextYear)
    .after($('<label for="year-' + nextYear + '">' + nextYear + '</label>'));

  // 2. Select the loaded year.
  $('#year-' + year).attr('checked', true);

  // 3. Select the loaded month.
  $('#month-' + month).attr('checked', true);

  // 4. Indicate the current month and year.
  $('#month-' + moment().month() + 1).addClass('current-month');
  $('#year-' + moment().year()).addClass('current-year');

  // 5. Populate items field with loaded items.
  itemsField.val(items);

  // 6. Give items field focus.
  focusOnItemsField();

  // 7. Generate TaskPaper month and set up regenerator function.
  //
  //    a. Populate the form from the loaded data,
  //    b. generate the TaskPaper month from the items field, and
  //    c. store the results in localStorage.
  function generateTaskPaperMonth() {

    // Read the form data; prepare to generate a month.
    var selectedYear   = $('input[name="year"]:checked'),
        selectedMonth  = $('input[name="month"]:checked'),
        year           = selectedYear.val(),
        month          = selectedMonth.val(),
        numberOfDays   = moment(year + '-' + month, 'YYYY-MM').daysInMonth(),
        generatedMonth = '',
        nextMonth      = {},
        itemsArray     = {},
        items          = {};

    // Build an array of items from the contents of the textarea. Split the
    // textarea by digits followed by newlines.
    var itemsArray = itemsField.val().split(/(\d+):?\n/m);

    // Hack off the first (empty) array item.
    itemsArray.shift();

    // Create an associative array by iterating through even and odd array
    // items. (Odd are days, even are that day's items.)
    $.each(itemsArray, function(key, value) {
      if (key % 2 === 0) {
        items[itemsArray[key]] = itemsArray[key + 1];
      }
    });

    // Turn each 'items' value in the object into an array split by newlines.
    $.each(items, function(key, value) {
      items[key] = items[key].trim().split('\n');
    });

    // Loop through each of the days and include the items therein.
    for (var day = 1; day <= numberOfDays; day++) {

      // Get the day name.
      var dayName = moment(year + '-' + month + '-' + day, 'YYYY-MM-DD').format('dddd');

      // Add the day heading:

      // 1. Add a newline if we're not on the first day.
      if (day > 1)
        generatedMonth += '\n';

      // 2. Add a zero for days under 10.
      if (day < 10)
        generatedMonth += '0';

      // 3. Add the day number itself, a colon, and a newline.
      generatedMonth += day + ' ' + dayName + ':';

      // If this day contains items, print them.
      if (items[day]) {

        $.each(items[day], function(key, value) {

          // If the line starts with two spaces or a tab character, make it a
          // note.
          if (value.substring(0, 2) == '  ' || value.substring(0, 1) == '\t') {
            generatedMonth += '\n\t' + value;
          }

          // If the line starts with a dash and a space, make it a todo. (This
          // is not the suggested syntax, but I'll parse it!)
          else if (value.substring(0, 2) == '- ') {
            generatedMonth += '\n\t' + value;
          }

          // Otherwise, make it a todo.
          else {
            generatedMonth += '\n\t- ' + value;
          }
        });

      }

      // If we're at the last day of the month, show a link back to the Month
      // Generator with the next year and month set in the query parameters.

      // If the month is December, start over with January.
      if (month === 12) {
        nextMonth['month'] = 1;
        nextMonth['year']  = Number(year) + 1;
      } else {
        nextMonth['month'] = Number(month) + 1;
        nextMonth['year']  = year;
      }

      if (day === numberOfDays) {
        generatedMonth += '\n\t- generate new Taskpaper month\n\t\thttp://matthewmcvickar.github.io/taskpaper-month-generator?year=' + nextMonth['year'] + '&month=' +  nextMonth['month'];
      }
    }

    // Print generated TaskPaper month to the screen.
    $('#taskpaper-month').val(generatedMonth);

    // Remove parameters from the URL, since we've changed the year and month on pageload.
    history.pushState({}, '', window.location.href.substring(0, window.location.href.indexOf('?')) + '?year=' + year + '&month=' + month);

    // Save values to localStorage.
    localStorage.setItem('TaskPaperMonthGenerator_year',  selectedYear.val());
    localStorage.setItem('TaskPaperMonthGenerator_month', selectedMonth.val());
    localStorage.setItem('TaskPaperMonthGenerator_items', itemsField.val());
  }

  // Regenerate TaskPaper month on pageload and subsequent updates.
  generateTaskPaperMonth();
  $('input[name="month"]').on('change', generateTaskPaperMonth)
  $('input[name="year"]').on('change', generateTaskPaperMonth)
  itemsField.on('keyup', $.debounce(250, generateTaskPaperMonth))


  // Make the Tab key insert an actual tab in the textarea.
  itemsField.keydown(function(key) {
    cursorPosition = itemsField.get(0).selectionStart

    if (key.keyCode == 9) {
      key.preventDefault()

      // Splice the tab character in at the cursor position.
      itemsField.val(itemsField.val().slice(0, cursorPosition) + '\t' + itemsField.val().slice(cursorPosition))

      // Move the cursor position two characters ahead (after the tab).
      itemsField.get(0).setSelectionRange(cursorPosition + 1, cursorPosition + 1)

      false
    }
  });


  // Buttons and dialog behavior.
  var emptyItemsButton            = $('#empty-items-button'),
      doEmptyButton               = $('#do-empty'),
      doNotEmptyButton            = $('#do-not-empty'),

      restoreDefaultItemsButton   = $('#restore-default-items-button'),
      doRestoreButton             = $('#do-restore'),
      doNotRestoreButton          = $('#do-not-restore');

      function showEmptyItemsButton() { emptyItemsButton.fadeIn('fast');          };
      function hideEmptyItemsButton() { emptyItemsButton.fadeOut('fast');         };
      function showEmptyItemsDialog() { $('#empty-items-dialog').fadeIn('fast');  };
      function hideEmptyItemsDialog() { $('#empty-items-dialog').fadeOut('fast'); };

      function showRestoreDefaultsDialog() { $('#restore-default-items-dialog').fadeIn('fast');  };
      function hideRestoreDefaultsDialog() { $('#restore-default-items-dialog').fadeOut('fast'); };

      function focusOnItemsField() {
        itemsField.focus();
      };

      function restoreDefaultsToItemsField() {
        itemsField.val(defaultItemList);
        focusOnItemsField()
      };


  // Restore default item list.
  restoreDefaultItemsButton.click(function() {
    // If it's already empty, just load the items and don't ask.
    if (itemsField.val().trim() !== '') {
      showRestoreDefaultsDialog();
      hideEmptyItemsDialog();
      focusOnItemsField();
    }
    // Otherwise, hide the 'Empty' button, restore defaults, and focus on the field.
    else {
      showEmptyItemsButton();
      restoreDefaultsToItemsField();
      focusOnItemsField();
    }
  });

  doNotRestoreButton.on('click', function() {
    hideRestoreDefaultsDialog();
    focusOnItemsField();
  });

  doRestoreButton.on('click', function() {
    hideRestoreDefaultsDialog();
    showEmptyItemsButton();
    restoreDefaultsToItemsField();
    focusOnItemsField();
  });

  // Empty the items field.
  emptyItemsButton.on('click', function() {
    hideRestoreDefaultsDialog();
    showEmptyItemsDialog();
    focusOnItemsField();
  });

  doNotEmptyButton.on('click', function() {
    hideEmptyItemsDialog();
    focusOnItemsField();
  });

  doEmptyButton.on('click', function() {
    hideEmptyItemsDialog();
    hideEmptyItemsButton();
    itemsField.val('');
    focusOnItemsField();
  });

  // Periodically check if the items field is empty. If it is, hide the 'Empty' button.
  itemsField.on('keyup', function() {
    if (itemsField.val().trim() !== '')
      showEmptyItemsButton();
    else
      hideEmptyItemsButton();
  });

  // Copy-to-clipboard button.
  var copyButton      = $('#copy-button'),
      copyButtonLabel = copyButton.children('span'),
      copyToClipboard = new Clipboard('#copy-button')

  copyToClipboard.on('success', function(e) {
    e.clearSelection();
    $('#taskpaper-month').scrollTop(0);
    copyButtonLabel.html('Copied!');
  });

  copyToClipboard.on('error', function(e) {
    copyButtonLabel.html('Press ⌘+C to copy')
  });

  // Reset the label on the 'Copy' button once user mouses off of it.
  copyButton.on('mouseleave', function(e) {
    setTimeout(function() {
      copyButtonLabel.html('Copy')
    }, 1000);
  });

});