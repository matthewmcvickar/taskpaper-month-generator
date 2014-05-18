$(function() {

  var yearField      = $('#year'),
      monthField     = $('#month'),
      itemsField     = $('#items'),
      taskpaperMonth = $('#taskpaper-month');

  // Fetch the default item list.
  function getDefaultItemList() {
    var defaultItemListData = null;

    $.get('default-item-list.txt', function(data) {
      defaultItemListData = data;
    });

    return defaultItemListData;
  }

  var defaultItemList = getDefaultItemList();

  // Focus on the items textbox on load.
  itemsField.focus();

  // If we have cookies, set the month <select>, year <select>, and
  // item list <textarea> to cookie values.

  // TODO

  // Otherwise:
  // 1. Populate the items <textarea> with the contents of the default item
  //    list text file.
  itemsField.html(getDefaultItemList);

  // 2. Populate year <select> with current and next year.
  var currentYear = new Date().getFullYear(),
      nextYear    = currentYear + 1,
      years       = [currentYear, nextYear];

  $.each(years, function(key, value) {
    yearField.append(
      $('<option></option>').attr('value', value).text(value)
    );
  });

  // Build a TaskPaper month with a given year and month.
  function generateMonth(year, month, items) {
    var year           = typeof year === 'undefined' ? new Date().getFullYear() : year,
        month          = typeof month === 'undefined' ? new Date().getMonth() : month,
        items          = typeof items === 'undefined' ? items : items,
        numberOfDays   = new Date(year, month, 0).getDate(),
        generatedMonth = '';

    // Build the array of items from the contents of the textarea.
    generatedMonth += items;

    // Loop through each of the days and include the items therein.
    for (var day = 1; day <= numberOfDays; day++) {

      // Add leading zeroes to day numbers under 10.
      day = day < 10 ? '0' + day : day;

      generatedMonth += day !== '01' ? '\n' : '';

      // Start the day.
      generatedMonth += day;

      // If this day contains items, print them.
      // TODO.
    }

    return generatedMonth;
  }

  // Update the generated month live with the rebuilt contents of
  // the item list text box.
  itemsField.on('keyup', function() {
    // TODO.
  });


  // Debug output.
  taskpaperMonth.html(generateMonth(null, null, getDefaultItemList()));

});