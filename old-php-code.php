<?php

// If a new 'items' value was set, update the cookie. Expiration is one year, and should always be enough, since this will be set by this script running at least once a month.
if ($_REQUEST['items-text'])
{
  setcookie('items', $_REQUEST['items-text'], time() + 315569260);

  // Reload the page, since we just set a cookie.
  header('Location: ' . $_SERVER['SCRIPT_NAME']);
}

// If the cookie exists, get its value. Otherwise populate the items with sample data.
if ($_COOKIE['items'])
  $items_plaintext = $_COOKIE['items'];
else
  $items_plaintext = "1\nto-do item\n\n14\nappointment reminder\n  details of appointment\n\n29\ntask\nanother task\n  a note for this task\n  another note";

// Create a flat array from the plain text in the cookie above by splitting it by newlines that contain a number.
$items_array = preg_split('~\n([0-9]+)~', "\n" . $items_plaintext, NULL, PREG_SPLIT_DELIM_CAPTURE | PREG_SPLIT_NO_EMPTY);

// Build a multidimensional array from the flat one by iterating through odd and even numbers in the array.
foreach (range(0, count($items_array) - 1, 2) as $key)
  $items[$items_array[$key]] = $items_array[$key + 1];

// Turn the list within each day into an array by splitting it by newlines.
foreach ($items as $key => $value)
  $items[$key] = explode("\n", trim($value));

// Set timezone so that PHP doesn't freak out.
date_default_timezone_set('UTC');


//////////////////////////////////////////////////////////////////////


// Print the textarea
if ($_REQUEST['month'])
  $days = date('t', mktime(0, 0, 0, $_REQUEST['month'], 1, date('Y')));
elseif ($_REQUEST['month'] && $_REQUEST['year'])
  $days = date('t', mktime(0, 0, 0, $_REQUEST['month'], 1, $_REQUEST['year']));
else
  $days = date('t', mktime(0, 0, 0, date('m'), 1, date('Y')));

for($day = 1; $day <= $days; $day++)
{
  if ($_REQUEST['month'])
    print("\n" . date('d l', mktime(0, 0, 0, $_REQUEST['month'], $day, date('Y'))) . ':');
  elseif ($_REQUEST['month'] && $_REQUEST['year'])
    print("\n" . date('d l', mktime(0, 0, 0, $_REQUEST['month'], $day, $_REQUEST['year'])) . ':');
  else
    print("\n" . date('d l', mktime(0, 0, 0, date('m'), $day, date('Y'))) . ':');

  if ($items[$day])
  {
    foreach ($items[$day] as $item)
    {
      if (substr($item, 0, 2) === '  ')
        print("\n\t\t" . trim($item));
      else
        print("\n\t- " . trim($item));
    }
  }

  if ($day == $days)
    print("\n\t- generate new Taskpaper month\n\t\thttp://taskpaper-month-generator.heroku.com/?month=" . date('m', strtotime('next month')));
}