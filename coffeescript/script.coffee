$ ->

  # Load the year, month, and items values from localStorage,
  # or get the current year and month and the default item set.
  defaultItemList = '1\nto-do item\n\n14\nanother task\n\tnotes\n\n29\ntask\nyet another task\n\tnotes and details\n\tanother note'

  if localStorage.getItem('items')
    items = localStorage.getItem('items')
    year  = localStorage.getItem('year')
    month = localStorage.getItem('month')
  else
    today = new Date()
    items = defaultItemList
    year  = today.getFullYear()
    month = today.getMonth()

  # Replace saved values with URL parameters, if they exist.
  url = $.url()
  year = url.param('year') if url.param('year')?
  month = url.param('month') if url.param('month')?


  # Initial setup:
  itemsField = $('#items')
  focusOnItemsField = -> itemsField.focus()

  # 1. Populate year buttons with current and next year.
  thisYear = new Date().getFullYear()
  nextYear = thisYear + 1

  $('#year-this')
    .attr('id', 'year-' + thisYear)
    .attr('value', thisYear)
    .after($('<label for="year-' + thisYear + '">' + thisYear + '</label>'))

  $('#year-next')
    .attr('id', 'year-' + nextYear)
    .attr('value', nextYear)
    .after($('<label for="year-' + nextYear + '">' + nextYear + '</label>'))

  # 2. Select the loaded year.
  $('#year-' + year).attr('checked', true)

  # 3. Select the loaded month.
  $('#month-' + month).attr('checked', true)

  # 4. Indicate the current month and year.
  currentMonth = new Date().getMonth() + 1
  currentYear  = new Date().getFullYear()
  $('#month-' + currentMonth).addClass('current-month')
  $('#year-' + currentYear).addClass('current-year')

  # 5. Populate items field with loaded items.
  itemsField.val(items)

  # 6. Give items field focus.
  focusOnItemsField()

  # 7. Generate TaskPaper month and set up regenerator function.
  #
  #    Populate the form from the loaded data
  #    generate the TaskPaper month from the items field, and
  #    store the results in localStorage.
  do generateTaskPaperMonth = ->

    # Read the form data; prepare to generate a month.
    selectedYear   = $('input[name="year"]:checked')
    selectedMonth  = $('input[name="month"]:checked')
    year           = selectedYear.val()
    month          = selectedMonth.val() - 1 # Months are zero-indexed.
    numberOfDays   = new Date(year, month, 0).getDate() + 1 # Days are also zero-indexed.
    generatedMonth = ''

    # Build an array of items from the contents of the textarea.
    # Split the textarea by digits followed by newlines.
    itemsArray = itemsField.val().split(/(\d+):?\n/m)

    # Hack off the first (empty) array item.
    itemsArray.shift()

    # Create an associative array by iterating through even and odd
    # array items. (Odd are days, even are that day's items.)
    items = {}
    $.each itemsArray, (key, value) ->
      items[itemsArray[key]] = itemsArray[key+1] if key%2 is 0

    # Turn each 'items' value in the object into an array split by newlines.
    $.each items, (key, value) ->
      items[key] = items[key].trim().split('\n')

    # Loop through each of the days and include the items therein.
    for day in [1..numberOfDays]

      # Get the day name.
      dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      dayName  = dayNames[new Date(year, month, day).getDay()]

      # Add the day heading:

      # 1. Add one to the day, since Javascript days are 0-indexed.
      dayNumber = day

      # 2. Add a newline if we're not on the first day.
      generatedMonth += '\n' if (dayNumber > 1)

      # 3. Add a zero for days under 10.
      generatedMonth += '0' if (dayNumber < 10)

      # 4. Add the day number itself, a colon, and a newline.
      generatedMonth += dayNumber + ' ' + dayName + ':'

      # If this day contains items, print them.
      if items[dayNumber]

        $.each items[dayNumber], (key, value) ->

          # If the line starts with two spaces or a tab character, make it a note.
          if value.substring(0, 2) == '  ' or value.substring(0, 1) == '\t'
            generatedMonth += '\n\t' + value

          # If the line starts with a dash and a space, make it a todo.
          # (This is not the suggested syntax, but that's OK!)
          else if value.substring(0, 2) == '- '
            generatedMonth += '\n\t' + value

          # Otherwise, make it a todo.
          else
            generatedMonth += '\n\t- ' + value

      # If we're at the last day of the month, generate a link back here!
      nextMonth = {}

      # If the month is December, start over with January.
      if month is 11
        nextMonth['month'] = 1
        nextMonth['year']  = Number(year) + 1
      else
        nextMonth['month'] = Number(month) + 2
        nextMonth['year']  = year

      if dayNumber == numberOfDays
        generatedMonth += '\n\t- generate new Taskpaper month\n\t\thttp://matthewmcvickar.github.io/taskpaper-month-generator?year=' + nextMonth['year'] + '&month=' +  nextMonth['month']

    # Print generated TaskPaper month to the screen.
    $('#taskpaper-month').val(generatedMonth)

    # Remove parameters from the URL, since we've changed the year and month on pageload.                             # Remember, zero-indexed month.
    cleanURL  = window.location.href.substring(0, window.location.href.indexOf('?')) + '?year=' + year + '&month=' + (Number(month) + 1)
    history.pushState({}, '', cleanURL)

    # Save values to localStorage.
    localStorage.setItem('year',  selectedYear.val())
    localStorage.setItem('month', selectedMonth.val())
    localStorage.setItem('items', itemsField.val())


  # Make the Tab key insert an actual tab in the textarea.
  itemsField.keydown (key) ->
    cursorPosition  = itemsField.get(0).selectionStart

    # If it's the Tab key, insert two spcaes instead.
    if key.keyCode == 9
      key.preventDefault()

      # Splice the tab character in at the cursor position.
      itemsField.val(itemsField.val().slice(0, cursorPosition) + '\t' + itemsField.val().slice(cursorPosition))

      # Move the cursor position two characters ahead (after the tab).
      itemsField.get(0).setSelectionRange(cursorPosition + 1, cursorPosition + 1)

      false


  # Regenerate TaskPaper month on subsequent updates.
  $('input[name="month"]').on 'change', generateTaskPaperMonth
  $('input[name="year"]').on 'change', generateTaskPaperMonth
  # itemsField.on 'keyup', $.debounce(250, generateTaskPaperMonth)
  # itemsField.on 'keyup', $.debounce(250, checkForEmptyItemsField)
  itemsField.on 'keyup', generateTaskPaperMonth
  itemsField.on 'keyup', ->
    if itemsField.val().trim() isnt ''
      fadeInEmptyItemsButton()
    else
      fadeOutEmptyItemsButton()



  emptyItemsButton              = $('#empty-items-button')
  emptyItemsDialog              = $('#empty-items-dialog')
  doEmptyButton                 = $('#do-empty')
  doNotEmptyButton              = $('#do-not-empty')

  fadeInEmptyItemsButton        = -> emptyItemsButton.fadeIn('fast')
  fadeOutEmptyItemsButton       = -> emptyItemsButton.fadeOut('fast')
  fadeInEmptyItemsConfirmation  = -> emptyItemsDialog.fadeIn('fast')
  fadeOutEmptyItemsConfirmation = -> emptyItemsDialog.fadeOut('fast')

  restoreDefaultItemsButton     = $('#restore-default-items-button')
  restoreDefaultItemsDialog     = $('#restore-default-items-dialog')
  doRestoreButton               = $('#do-restore')
  doNotRestoreButton            = $('#do-not-restore')

  fadeInRestoreDefaultsButton   = -> restoreDefaultItemsDialog.fadeIn('fast')
  fadeOutRestoreDefaultsButton  = -> restoreDefaultItemsDialog.fadeOut('fast')

  setItemsFieldToDefaults = ->
    itemsField.val(defaultItemList)
    focusOnItemsField()

  # Restore default item list.
  restoreDefaultItemsButton.click ->
    # If it's already empty, just load the items and don't ask.
    if itemsField.val().trim() isnt ''
      fadeInRestoreDefaultsButton()
      fadeOutEmptyItemsConfirmation()
      focusOnItemsField()
    # Otherwise, hide the 'Empty' button, restore defaults, and focus on the field.
    else
      fadeInEmptyItemsButton()
      setItemsFieldToDefaults()
      focusOnItemsField()

  doNotRestoreButton.click ->
    fadeOutRestoreDefaultsButton()
    focusOnItemsField()

  doRestoreButton.click ->
    fadeOutRestoreDefaultsButton()
    fadeInEmptyItemsButton()
    setItemsFieldToDefaults()
    focusOnItemsField()

  # Empty items field.
  emptyItemsButton.click ->
    fadeOutRestoreDefaultsButton()
    fadeInEmptyItemsConfirmation()
    focusOnItemsField()

  doNotEmptyButton.click ->
    fadeOutEmptyItemsConfirmation()
    focusOnItemsField()

  doEmptyButton.click ->
    fadeOutEmptyItemsConfirmation()
    fadeOutEmptyItemsButton()
    itemsField.val('')
    focusOnItemsField()


  # ZeroClipboard
  # https:#github.com/zeroclipboard/zeroclipboard
  # Flash/JS button to copy the generated TaskPaper month.
  ZeroClipboard.config({ moviePath: 'js/vendor/ZeroClipboard.swf' })
  client = new ZeroClipboard($('#copy-button'))

  client.on 'load', (client) ->
    client.on 'datarequested', (client) ->
      client.setText($('#taskpaper-month').val())

  client.on 'noFlash', ->
    $('#copy-button').hide()
    console.error('No Flash installed. Hiding the \'Copy\' button.')

  client.on 'wrongFlash', ->
    $('#copy-button').hide()
    console.error('Wrong Flash installed. Hiding the \'Copy\' button.')
