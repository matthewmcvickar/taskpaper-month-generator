$(function() {

  // Populate year <select> with current and next year.
  var year_select  = $('.year-select'),
      current_year = new Date().getFullYear(),
      next_year    = current_year++,
      years        = [next_year, current_year];

  $.each(years, function(key, value) {
    year_select.append(
      $('<option></option>').attr('value', key).text(value)
    );
  });

  // Switch month <select>, year <select>, and <textarea> to cookie values.


  // And then...

});