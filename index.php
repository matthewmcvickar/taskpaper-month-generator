<?php

/*

# Generate Taskpaper Month

Generator: http://taskpaper-month-generator.herokuapp.com
Source:    https://github.com/matthewmcvickar/taskpaper-month-generator

Part of the Taskpaper Tiles system by Matthew McVickar
https://github.com/matthewmcvickar/taskpapertiles

Creates a month list for the requested month and year (or the current month and year, if unspecified) in TaskPaper, populating days with items as specified in the plaintext hierarchy below.

*/

// If a new 'items' value was set, update the cookie. Expiration is one year, and should always be enough, since this will be set by this script running at least once a month.
if ($_REQUEST['items_text'])
{
  setcookie('items', $_REQUEST['items_text'], time() + 315569260);

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

?><!doctype html>

<html>
  <head>
    <title>Taskpaper Month Generator</title>
    <style>
    html,
    body
    {
      height: 100%;
      margin: 0;
      padding: 0;
      overflow: hidden;
    }

    body
    {
      font-family: Helvetica, sans-serif;
      font-size: 16px;
      min-height: 100%;
    }

    form
    {
      float: left;
      background: #eee;
      width: 48%;
      padding: 1%;
      height: 98%;
    }

    form textarea
    {

      font-family: Helvetica, sans-serif;
      font-size: 16px;
      height: 50%;
      width: 97.5%;
      padding: 1%;
      resize: vertical;
    }

    form select,
    form input
    {
      float: left;
      font-size: 16px;
      margin: 0 1em 1em 0;
    }

    textarea.taskpaper_month
    {
      background: #f4f4f4;
      float: left;
      height: 98%;
      width: 47.75%;
      border: 0;
      font-family: Helvetica, sans-serif;
      font-size: 16px;
      line-height: 1.3;
      padding: 1% 1% 1% 1.25%;
      resize: none;
    }

    h1
    {
      line-height: 1;
      margin: 0 0 .25em;
    }

    ol
    {
      margin: 0 0 0 1.25em;
      padding: 0;
    }

    p,
    li
    {
      clear: both;
      font-size: 13px;
      line-height: 1.8;
      float: none;
    }

    hr
    {
      border: 0;
      border-top: 4px solid #ccc;
      clear: both;
      height: 0;
      margin: 1.25em 0 1.5em;
    }

    .credit
    {
      color: #666;
      margin-top: 2em;
    }

    .credit a:link,
    .credit a:visited,
    .credit a:active
    {
      color: #888;
    }

    .credit a:hover
    {
      color: #333;
    }
    </style>
  </head>
  <body>
    <form action="<?php echo $_SERVER['SCRIPT_NAME'] ?>" method="post">
      <h1>TaskPaper Month Generator</h1>

      <ol>
        <li>Type your to-dos and notes in the textbox below, one per line under the day it should appear.</li>
        <li>Hit the &lsquo;Update&rsquo; button.</li>
        <li>Copy the generated text in the right pane and paste it into TaskPaper.</li>
      </ol>

      <hr>

      <select name="month">
        <?php
        for ($i = 1; $i < 13; $i++)
        {
          if ($i < 10)
            $i = '0' . $i;

          print("<option value=\"$i\"");

          if ($i == $_REQUEST['month'])
            print(' selected');
          elseif ($i == date('m'))
            print(' selected');

          print('>' . date('F', mktime(0, 0, 0, $i, 1, 1)) . '</option>');
        }
        ?>
      </select>

      <select name="year">
        <?php
        for ($i = date('Y'); $i <= date('Y') + 1; $i++)
        {
          print("<option value=\"$i\"");

          if ($i == $_REQUEST['year'])
            print(' selected');
          elseif ($i == date('Y'))
            print(' selected');

          print('>' . $i . '</option>');
        }
        ?>
      </select>

      <input tabindex="2" type="submit" value="Update">

      <textarea tabindex="1" name="items_text"><?php print($items_plaintext); ?></textarea>

      <p class="credit">
        Use simple syntax to generator a copy-and-pasteable month of tasks into TaskPaper. <a href="https://github.com/matthewmcvickar/taskpaper-month-generator">Source on GitHub.</a><br>
        For use with <a href="https://github.com/matthewmcvickar/taskpapertiles">TaskPaper Tiles</a>, a TaskPaper-based productivity framework.<br>
        TaskPaper Month Generator and TaskPaper Tiles by <a href="http://matthewmcvickar.com">Matthew McVickar</a>.<br>
        <a href="http://www.hogbaysoftware.com/products/taskpaper">TaskPaper</a> by <a href="https://twitter.com/jessegrosjean">Jesse Grosjean</a>.
      </p>
    </form>

    <textarea class="taskpaper_month" readonly onclick="this.select();"><?php

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
    ?></textarea>
  </body>
</html>