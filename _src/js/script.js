global.jQuery = require('jquery');
var Clipboard = require('clipboard');
var moment = require('moment');
var debounce = require('lodash/debounce');
var URI = require('urijs');

jQuery(document).ready(function($) {

  // So many variables!
  var defaultItemList = "☞ Use day numbers for items that occur on a particular day. Just like in TaskPaper, items start with a dash and notes are indented without a dash.\n\n1:\n- to-do item\n\t- a sub-item\n\t\ta note\n- another item\n\n14:\n- task\n- yet another task\n\tnotes and details\n\tanother note\n\n☞ Use a day name (‘mon’, ‘monday’, ‘Mondays’ all work) for items that repeat on a certain day of the week.\n\nmon:\n- a weekly task\n\tnotes for a weekly task\n\nWednesdays:\n- happens every Wednesday\n\n☞ Use ‘last’ or ‘last day’ or ‘final’ for items that happen on the last day of the month.\n\nlast:\n- a task on the last day of the month";

  var items;
  var itemsField = $('#items');
  var year;
  var month;
  var now = moment();
  var thisYear = now.year();
  var nextYear = thisYear + 1;

  var restoreDefaultItemsButton = $('#restore-default-items-button');
  var doRestoreButton           = $('#do-restore');
  var doNotRestoreButton        = $('#do-not-restore');
  var restoreUserTextButton     = $('#restore-user-text-button');

  // UI functions.
  function showEmptyItemsDialog() { $('#empty-items-dialog').fadeIn('fast');  }
  function hideEmptyItemsDialog() { $('#empty-items-dialog').fadeOut('fast'); }
  function showRestoreDefaultsDialog() { $('#restore-default-items-dialog').fadeIn('fast');  }
  function hideRestoreDefaultsDialog() { $('#restore-default-items-dialog').fadeOut('fast'); }

  function focusOnItemsField() {
    itemsField.focus();
  }

  function restoreDefaultsToItemsField() {
    itemsField.val(defaultItemList);
    focusOnItemsField();
  }

  // Generate the month.
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
    itemsArray = itemsField.val().split(/^(\d+|sun|mon|tue|wed|thu|fri|sat|sunday|monday|tuesday|wednesday|thursday|friday|saturday|last|last day|final)s? ?:?\n/mi);

    // Hack off the first (empty) array item.
    itemsArray.shift();

    // The itemsArray has split our textbox into a series of headings (day
    // numbers or day names), each followed by its items. We now create an
    // associative array by iterating through even and odd array items.
    // (Odd are days, even are that day's items.)
    $.each(itemsArray, function(key, val) {

      // Normalize day names by only keeping the first three letters. I.e., turn
      // 'Tuesday' and 'wednesday' into 'tue' and 'wed'.
      if (val.match(/(sun|mon|tue|wed|thu|fri|sat)/i)) {
        itemsArray[key] = val.toLowerCase().substr(0, 3);
      }

      // Normalize 'last' and 'final' to 'last'.
      else if (val.match(/(last|last day|final)/i)) {
        itemsArray[key] = 'last';
      }

      // Normalize numbers to omit leading zeros.
      else if (parseInt(val)) {
        itemsArray[key] = parseInt(val, 10);
      }

      if (key % 2 === 0) {
        items[itemsArray[key]] = itemsArray[key + 1];
      }
    });

    // Turn each 'items' value in the object into an array split by newlines.
    $.each(items, function(key) {
      items[key] = items[key].trim().split('\n');
    });

    // Loop through each of the days and include the items therein.
    for (var day = 1; day <= numberOfDays; day++) {

      // Get the day name.
      var dayName = moment(year + '-' + month + '-' + day, 'YYYY-MM-DD').format('dddd');
      var shortenedDayName = dayName.toLowerCase().substr(0, 3);

      // Add the day heading:

      // 1. Add a newline if we're not on the first day.
      if (day > 1) {
        generatedMonth += '\n';
      }

      // 2. Add a zero for days under 10.
      if (day < 10) {
        generatedMonth += '0';
      }

      // 3. Add the day number itself, a colon, and a newline.
      generatedMonth += day + ' ' + dayName + ':';

      // If this day number or day name contains items, print them.
      if (items[day] || items[shortenedDayName] || (items['last'] && day === numberOfDays)) {

        // Combine all day items lists so we don't overwrite something if, say,
        // an event happens on Monday the 4th and an event happens every Monday.
        var thisDay = [];

        if (items['last'] && day === numberOfDays) {
          var thisDay = thisDay.concat(items['last']);
        }

        if (items[shortenedDayName]) {
          var thisDay = thisDay.concat(items[shortenedDayName]);
        }

        if (items[day]) {
          var thisDay = thisDay.concat(items[day]);
        }

        // Step through each item and parse it.
        for (var i = 0; i < thisDay.length; i++) {

          var line = thisDay[i];

          // If the line is empty, ignore it.
          if (line.length === 0) {
            continue;
          }

          // If the line starts with an arrow, that's an instruction and should
          // be ignored.
          if (line.substr(0, 1) === '☞') {
            continue;
          }

          // If the line starts with two spaces, a letter, or tab character,
          // make it a note.
          if (line.substring(0, 2) === '  ' || line.substring(0, 1) === '\t' || line.substring(0, 1) !== '-') {
            generatedMonth += '\n\t' + line;
          }

          // Otherwise, make it a todo.
          else {
            generatedMonth += '\n\t' + line;
          }
        }

      }

      // If we're at the last day of the month, show a link back to the Month
      // Generator with the next year and month set in the query parameters.

      // If the month is December, start over with January.
      if (month === '12') {
        nextMonth.month = 1;
        nextMonth.year  = Number(year) + 1;
      } else {
        nextMonth.month = Number(month) + 1;
        nextMonth.year  = year;
      }

      if (day === numberOfDays) {
        generatedMonth += '\n\t- generate new Taskpaper month\n\t\thttp://matthewmcvickar.github.io/taskpaper-month-generator/?year=' + nextMonth.year + '&month=' +  nextMonth.month;
      }
    }

    // Print generated TaskPaper month to the screen.
    $('#taskpaper-month').val(generatedMonth);

    // Remove parameters from the URL, since we've changed the year and month on pageload.
    history.pushState({}, '', location.href.substring(0, location.href.indexOf('?')) + '?year=' + year + '&month=' + month);

    // Save values to localStorage.
    localStorage.setItem('TaskPaperMonthGenerator_year',  selectedYear.val());
    localStorage.setItem('TaskPaperMonthGenerator_month', selectedMonth.val());
    localStorage.setItem('TaskPaperMonthGenerator_items', itemsField.val());
  }


  // ------------------------------------------------------------------------ //

  // Load the year, month, and items values from localStorage, or get the
  // current year and month and the default item set.
  if (localStorage.getItem('TaskPaperMonthGenerator_items')) {
    items = localStorage.getItem('TaskPaperMonthGenerator_items');
    year  = localStorage.getItem('TaskPaperMonthGenerator_year');
    month = localStorage.getItem('TaskPaperMonthGenerator_month');
  } else {
    items = defaultItemList;
    year  = now.year();
    month = now.month() + 1;
  }

  // Replace saved values with URL parameters, if they exist.
  if (URI().hasQuery('year') && URI().search(true).year !== 'undefined') {
    year  = URI().search(true).year;
  }

  if (URI().hasQuery('month') && typeof URI().search(true).month !== 'undefined') {
    month = URI().search(true).month;
  }

  // Initial setup.

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
  $('#month-' + (now.month() + 1)).addClass('current-month');
  $('#year-' + now.year()).addClass('current-year');

  // 5. Populate items field with loaded items.
  itemsField.val(items);

  // 6. Give items field focus.
  focusOnItemsField();

  // 7. Generate TaskPaper month and set up regenerator function.
  //
  //    a. Populate the form from the loaded data,
  //    b. generate the TaskPaper month from the items field, and
  //    c. store the results in localStorage.
  generateTaskPaperMonth();

  // Watch the input fields for changes, and re-generate the month.
  $('input[name="month"]').on('change', generateTaskPaperMonth);
  $('input[name="year"]').on('change', generateTaskPaperMonth);
  itemsField.on('keyup', debounce(generateTaskPaperMonth, 200));

  // Make the Tab key insert an actual tab in the textarea.
  itemsField.keydown(function(key) {
    var cursorPosition = itemsField.get(0).selectionStart;

    if (key.keyCode === 9) {
      key.preventDefault();

      // Splice the tab character in at the cursor position.
      itemsField.val(itemsField.val().slice(0, cursorPosition) + '\t' + itemsField.val().slice(cursorPosition));

      // Move the cursor position two characters ahead (after the tab).
      itemsField.get(0).setSelectionRange(cursorPosition + 1, cursorPosition + 1);

      return false;
    }
  });


  // ------------------------------------------------------------------------ //


  // Buttons and dialog behavior.

  // Restore default item list.
  restoreDefaultItemsButton.click(function() {
    // If it's already empty, just load the items and don't ask.
    if (itemsField.val().trim() !== '') {
      showRestoreDefaultsDialog();
      hideEmptyItemsDialog();
      focusOnItemsField();
      generateTaskPaperMonth();
    }
    // Otherwise, hide the 'Empty' button, restore defaults, and focus on the field.
    else {
      restoreDefaultsToItemsField();
      focusOnItemsField();
      generateTaskPaperMonth();
    }
  });

  doNotRestoreButton.on('click', function() {
    hideRestoreDefaultsDialog();
    focusOnItemsField();
    generateTaskPaperMonth();
  });

  doRestoreButton.on('click', function() {
    // Save user text to a separate localStorage variable before restoring
    // defaults so that it can be restored.
    localStorage.setItem('TaskPaperMonthGenerator_backup', itemsField.val());

    // Give that backup function a fraction of a second to run first.
    setTimeout(
      function() {
        restoreDefaultItemsButton.hide();
        restoreUserTextButton.show();
        hideRestoreDefaultsDialog();
        restoreDefaultsToItemsField();
        focusOnItemsField();
        generateTaskPaperMonth();
      },
      100
    )
  });

  // Restore user's text from before loading defaults.
  restoreUserTextButton.click(function() {
    restoreUserTextButton.hide()
    restoreDefaultItemsButton.show();

    // Restore user's backup from local storage.
    itemsField.val(localStorage.getItem('TaskPaperMonthGenerator_backup'));
  });

  // Copy-to-clipboard button.
  var copyButton      = $('#copy-button'),
      copyButtonLabel = copyButton.children('span'),
      copyToClipboard = new Clipboard('#copy-button');

  copyToClipboard.on('success', function(e) {
    e.clearSelection();
    $('#taskpaper-month').scrollTop(0);
    copyButtonLabel.html('Copied!');
  });

  copyToClipboard.on('error', function() {
    copyButtonLabel.html('Press ⌘+C to copy');
  });

  // Reset the label on the 'Copy' button once user mouses off of it.
  copyButton.on('mouseleave', function() {
    setTimeout(function() {
      copyButtonLabel.html('Copy');
    }, 1000);
  });

});
