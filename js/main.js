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

    // Read the form data; prepare to generate a month.
    var itemsText      = itemsField.val(),
        itemsArray     = [],
        items          = {},
        numberOfDays   = new Date(data.year, data.month, 0).getDate(),
        generatedMonth = '';

    // Build an array of items from the contents of the textarea.
    // Split the textarea by digits followed by newlines.
    itemsArray = itemsText.split(/(\d+):?\n/m);

    // Hack off the first (empty) array item.
    itemsArray.shift()

    // Create an associative array by iterating through even and odd
    // array items. (Odd are day numbers, even are that day's items.)
    $.each(itemsArray, function(key, value) {
      if (key%2 === 0) {
        items[itemsArray[key]] = itemsArray[key+1];
      }
    });

    // Turn each 'items' value in the object into an array split by newlines.
    $.each(items, function(key, value) {
      items[key] = items[key].trim().split('\n');
    });

    // Loop through each of the days and include the items therein.
    for (var day = 0; day < numberOfDays; day++) {

      // Get the day name.
      var dayName = getDayName(new Date(data.year, data.month, day).getDay());

      // Add the day heading:

      // Add one to the day, since Javascript days are 0-indexed.
      dayNumber = day + 1;

      // Add a newline if we're not on the first day.
      if (dayNumber > 1)
        generatedMonth += '\n';

      // Add a zero for days under 10.
      if (dayNumber < 10)
        generatedMonth += '0'

      // Add the day number itself, a colon, and a newline.
      generatedMonth += dayNumber + ' ' + dayName + ':';

      // If this day contains items, print them.
      if (items[dayNumber]) {
        $.each(items[dayNumber], function(key, value) {
          // If the line starts with two spaces, make it a note.
          if (value.substring(0, 2) === '  ')
            generatedMonth += '\n\t\t' + value

          // If the line starts with a dash and a space, make it a todo.
          // (This is not the suggested syntax, but that's OK!)
          else if (value.substring(0, 2) === '- ')
            generatedMonth += '\n\t' + value

          // Otherwise, make it a todo.
          else
            generatedMonth += '\n\t- ' + value
        });
      }

      // If we're on the last day of the month, generated a link back here!
      if (dayNumber === numberOfDays)
        generatedMonth += '\n\t- generate new Taskpaper month\n\t\thttp://matthewmcvickar.github.io/taskpaper-month-generator';

    }

    // Print generated TaskPaper month to the screen.
    taskpaperMonth.html(generatedMonth);

    // Save values to localStorage.
    localStorage.setItem('year',  yearField.val()  );
    localStorage.setItem('month', monthField.val() );
    localStorage.setItem('items', itemsField.val() );
  };


  // // // // // // // // // // // // // // // // // //


  // Initial setup:

  // 1. Populate year <select> with current and next year.
  var currentYear = new Date().getFullYear(),
      nextYear    = currentYear + 1,
      years       = [currentYear, nextYear];

 $.each(years, function (key, value){
    yearField.append(
      $('<option></option>').attr('value', value).text(value)
    );
  });

  // 2. Select the loaded year.
  $('#year').val(data.year);

  // 3. Select the loaded month.
  $('#month').val(data.month);

  // 4. Populate items field with loaded items.
  // 5. Give items field focus.
  itemsField.html(data.items).focus();

  // 6. Generate TaskPaper month for the first time.
  generateTaskPaperMonth();


  // // // // // // // // // // // // // // // // // //


  // Regenerate TaskPaper month on subsequent updates.
  itemsField.on('keyup', generateTaskPaperMonth);
};

documentReady
  .then(loadFromCookiesOrDefaults)
  .then(populateAndProcessAndRememberFormData);

// Get the name of the day.
function getDayName(number) {
  days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[number];
}