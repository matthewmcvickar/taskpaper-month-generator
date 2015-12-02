$ ->

  # Load the year, month, and items values from localStorage,
  # or get the current year and month and the default item set.
  defaultItemList = '1\nto-do item\n\n14\nanother task\n\tnotes\n\n29\ntask\nyet another task\n\tnotes and details\n\tanother note'

  if localStorage.getItem('TaskPaperMonthGenerator_items')
    items = localStorage.getItem('TaskPaperMonthGenerator_items')
    year  = localStorage.getItem('TaskPaperMonthGenerator_year')
    month = localStorage.getItem('TaskPaperMonthGenerator_month')
  else
    items = defaultItemList
    year  = moment().year()
    month = moment().month() + 1

  # Replace saved values with URL parameters, if they exist.
  if URI().hasQuery('year') && URI().search(true).year is not 'undefined'
    year = URI().search(true).year
  if URI().hasQuery('month') && typeof URI().search(true).month is not 'undefined'
    month = URI().search(true).month

  # Initial setup:
  itemsField = $('#items')
  focusOnItemsField = -> itemsField.focus()

  # 1. Populate year buttons with current and next year.
  thisYear = moment().year()
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
  $('#month-' + moment().month() + 1).addClass('current-month')
  $('#year-' + moment().year()).addClass('current-year')

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
    month          = selectedMonth.val()
    numberOfDays   = moment(year + '-' + month, 'YYYY-MM').daysInMonth()
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
      dayName = moment(year + '-' + month + '-' + day, 'YYYY-MM-DD').format('dddd')

      # Add the day heading:

      # 1. Add a newline if we're not on the first day.
      generatedMonth += '\n' if (day > 1)

      # 2. Add a zero for days under 10.
      generatedMonth += '0' if (day < 10)

      # 3. Add the day number itself, a colon, and a newline.
      generatedMonth += day + ' ' + dayName + ':'

      # If this day contains items, print them.
      if items[day]

        $.each items[day], (key, value) ->

          # If the line starts with two spaces or a tab character, make it a note.
          if value.substring(0, 2) == '  ' or value.substring(0, 1) == '\t'
            generatedMonth += '\n\t' + value

          # If the line starts with a dash and a space, make it a todo.
          # (This is not the syntax I suggest you use, but we'll parse it!)
          else if value.substring(0, 2) == '- '
            generatedMonth += '\n\t' + value

          # Otherwise, make it a todo.
          else
            generatedMonth += '\n\t- ' + value

      # If we're at the last day of the month, generate a link back here!
      nextMonth = {}

      # If the month is December, start over with January.
      if month is 12
        nextMonth['month'] = 1
        nextMonth['year']  = Number(year) + 1
      else
        nextMonth['month'] = Number(month) + 1
        nextMonth['year']  = year

      if day == numberOfDays
        generatedMonth += '\n\t- generate new Taskpaper month\n\t\thttp://matthewmcvickar.github.io/taskpaper-month-generator?year=' + nextMonth['year'] + '&month=' +  nextMonth['month']

    # Print generated TaskPaper month to the screen.
    $('#taskpaper-month').val(generatedMonth)

    # Remove parameters from the URL, since we've changed the year and month on pageload.
    cleanURL = window.location.href.substring(0, window.location.href.indexOf('?')) + '?year=' + year + '&month=' + month
    history.pushState({}, '', cleanURL)

    # Save values to localStorage.
    localStorage.setItem('TaskPaperMonthGenerator_year',  selectedYear.val())
    localStorage.setItem('TaskPaperMonthGenerator_month', selectedMonth.val())
    localStorage.setItem('TaskPaperMonthGenerator_items', itemsField.val())


  # Regenerate TaskPaper month on subsequent updates.
  $('input[name="month"]').on 'change', generateTaskPaperMonth
  $('input[name="year"]').on 'change', generateTaskPaperMonth
  itemsField.on 'keyup', $.debounce(250, generateTaskPaperMonth)


  # Make the Tab key insert an actual tab in the textarea.
  itemsField.keydown (key) ->
    cursorPosition = itemsField.get(0).selectionStart

    if key.keyCode == 9
      key.preventDefault()

      # Splice the tab character in at the cursor position.
      itemsField.val(itemsField.val().slice(0, cursorPosition) + '\t' + itemsField.val().slice(cursorPosition))

      # Move the cursor position two characters ahead (after the tab).
      itemsField.get(0).setSelectionRange(cursorPosition + 1, cursorPosition + 1)

      false


  # Buttons and dialog behavior.
  emptyItemsButton           = $('#empty-items-button')
  doEmptyButton              = $('#do-empty')
  doNotEmptyButton           = $('#do-not-empty')

  showEmptyItemsButton       = -> emptyItemsButton.fadeIn('fast')
  hideEmptyItemsButton       = -> emptyItemsButton.fadeOut('fast')
  showEmptyItemsDialog       = -> $('#empty-items-dialog').fadeIn('fast')
  hideEmptyItemsDialog       = -> $('#empty-items-dialog').fadeOut('fast')

  restoreDefaultItemsButton  = $('#restore-default-items-button')
  doRestoreButton            = $('#do-restore')
  doNotRestoreButton         = $('#do-not-restore')

  showRestoreDefaultsDialog  = -> $('#restore-default-items-dialog').fadeIn('fast')
  hideRestoreDefaultsDialog  = -> $('#restore-default-items-dialog').fadeOut('fast')

  restoreDefaultsToItemsField    = ->
    itemsField.val(defaultItemList)
    focusOnItemsField()

  # Restore default item list.
  restoreDefaultItemsButton.click ->

    # If it's already empty, just load the items and don't ask.
    if itemsField.val().trim() isnt ''
      showRestoreDefaultsDialog()
      hideEmptyItemsDialog()
      focusOnItemsField()

    # Otherwise, hide the 'Empty' button, restore defaults, and focus on the field.
    else
      showEmptyItemsButton()
      restoreDefaultsToItemsField()
      focusOnItemsField()

  doNotRestoreButton.click ->
    hideRestoreDefaultsDialog()
    focusOnItemsField()

  doRestoreButton.click ->
    hideRestoreDefaultsDialog()
    showEmptyItemsButton()
    restoreDefaultsToItemsField()
    focusOnItemsField()

  # Empty the items field.
  emptyItemsButton.click ->
    hideRestoreDefaultsDialog()
    showEmptyItemsDialog()
    focusOnItemsField()

  doNotEmptyButton.click ->
    hideEmptyItemsDialog()
    focusOnItemsField()

  doEmptyButton.click ->
    hideEmptyItemsDialog()
    hideEmptyItemsButton()
    itemsField.val('')
    focusOnItemsField()

  # Periodically check if the items field is empty. If it is, hide the 'Empty' button.
  itemsField.on 'keyup', ->
    if itemsField.val().trim() isnt ''
      showEmptyItemsButton()
    else
      hideEmptyItemsButton()

  # Copy-to-clipboard button.
  copyButton      = $('#copy-button')
  copyButtonLabel = copyButton.children('span')

  copyToClipboard = new Clipboard('#copy-button')

  copyToClipboard.on 'success', (e) ->
    e.clearSelection()
    $('#taskpaper-month').scrollTop(0)
    copyButtonLabel.html('Copied!')

  copyToClipboard.on 'error', (e) ->
    copyButtonLabel.html('Press ⌘+C to copy')

  # Reset the label on the 'Copy' button once user mouses off of it.
  copyButton.on 'mouseleave', (e) ->
    setTimeout (->
      copyButtonLabel.html('Copy')
    ), 1000
