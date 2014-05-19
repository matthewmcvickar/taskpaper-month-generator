// Wait until the form has loaded entirely.
var documentReady = new Promise($(document).ready);

// Load the year, month, and items values from localStorage,
// or get the current year and month and the default item set.
var loadFromCookiesOrDefaults = function (){

  return new Promise(function (resolve){
    if (localStorage.getItem('items')){
      resolve({
        items : localStorage.getItem('items'),
        year  : localStorage.getItem('year'),
        month : localStorage.getItem('month')
      });
    } else {
      $.get('default-item-list.txt', function (data) {
        var today = new Date();

        resolve({
          items : data,
          year  : today.getFullYear(),
          month : today.getMonth()
        });
      });
    }
  });

};

// Populate the form from the loaded data,
// generate the TaskPaper month from the items field, and
// store the results in localStorage.
var populateAndProcessAndRememberFormData = function (data){

  var yearField      = $('#year'),
      monthField     = $('#month'),
      itemsField     = $('#items'),
      taskpaperMonth = $('#taskpaper-month');

  var generateTaskPaperMonth = function (){
    // read contents of form, e.g.
    var items          = itemsField.html();
        numberOfDays   = new Date(data.year, data.month, 0).getDate(),
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

    taskpaperMonth.html(generatedMonth);
  };

  // Initial setup:

  // 1. Populate year <select> with current and next year.
  var currentYear = new Date().getFullYear(),
      nextYear    = currentYear + 1,
      years       = [currentYear, nextYear];

  $.each(years, function(key, value) {
    yearField.append(
      $('<option></option>').attr('value', value).text(value)
    );
  });

  // 2. Select the loaded year.

  // TODO

  // 3. Select the loaded month.

  // TODO

  // 4. Populate items field with loaded items.
  // 5. Give items field focus.
  itemsField.html(data.items).focus();

  // 6. Generate TaskPaper month for the first time.
  generateTaskPaperMonth();

  //

  // Regenerate TaskPaper month on subsequent updates.
  itemsField.on('keyup', generateTaskPaperMonth);
};

documentReady
  .then(loadFromCookiesOrDefaults)
  .then(populateAndProcessAndRememberFormData);
