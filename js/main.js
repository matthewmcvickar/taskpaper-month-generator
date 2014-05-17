$(function() {

  // Form elements.
  var yearSelect  = $('.year-select'),
      monthSelect = $('.month-select'),
      itemsText   = $('.items-text');

  // If we have cookies, set the month <select>, year <select>, and
  // item list <textarea> to cookie values.
  // TODO

  // Otherwise, populate the items <textarea> with the contents of
  // the default task list text file.
  $.get('default-task-list.txt', function(data) {
    itemsText.html(data);
  });

  // And populate year <select> with current and next year.
  var currentYear = new Date().getFullYear(),
      nextYear    = currentYear + 1,
      years       = [currentYear, nextYear];

  $.each(years, function(key, value) {
    yearSelect.append(
      $('<option></option>').attr('value', value).text(value)
    );
  });

  // Update the generated month live with the translated contents of
  // the text box.

});