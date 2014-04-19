$(function() {

  // Populate year <select> with current and next year.
  var yearSelect  = $('.year-select'),
      currentYear = new Date().getFullYear(),
      nextYear    = currentYear + 1,
      years       = [currentYear, nextYear];

  $.each(years, function(key, value) {
    yearSelect.append(
      $('<option></option>').attr('value', value).text(value)
    );
  });

  // Switch month <select>, year <select>, and <textarea> to cookie values.


  // And then...

});