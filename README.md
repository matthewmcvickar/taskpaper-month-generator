# TaskPaper Month Generator

**Use it here: [matthewmcvickar.github.io/taskpaper-month-generator](http://matthewmcvickar.github.io/taskpaper-month-generator)**

Given a list of tasks, generates a list of days and tasks for a specified month that can be pasted into TaskPaper for a monthly schedule.

For use with [Taskpaper Tiles](https://github.com/matthewmcvickar/taskpapertiles), my [TaskPaper](http://www.hogbaysoftware.com/products/taskpaper)-based productivity framework.


## Instructions

Go to the **[TaskPaper Month Generator](http://matthewmcvickar.github.io/taskpaper-month-generator)**.

To add tasks to a day, enter the day number, start a new line, and list each new task on a new line, like you would in TaskPaper. Start a new line and press `Tab` to start an indented note. (TaskPaper syntax—that is, colons after day names and dashes in front of tasks—is not necessary.)

### Example

```
1
to-do item

14
another task
  notes

29
task
yet another task
  notes and details
  another note
```

The generated TaskPaper month will be updated as you type. Hit the **Copy** button in the generated month box to copy it all to your clipboard, then paste it into a Taskpaper document.

To generate an empty month, click the **Empty** button in the editor.


## Nifty Features

- The <kbd>Tab</kbd> key works in the editor, to allow for notes.
- Generates a link to generate the next month at the end of the list.
- Quick copy-to-clipboard button.
- Utilizes local storage so that your list of monthly tasks is retained between visits.


## Planned Features

- Syntax for tasks on the last day of the month.
- Syntax for tasks that occur weekly on a given day.


## Credits

### TaskPaper

[TaskPaper](http://www.hogbaysoftware.com/products/taskpaper) is developed by Jesse Grosjean of Hog Bay Software.

### Development

- [Sublime Text](http://www.sublimetext.com/)
- [Grunt](http://gruntjs.com/)
- [SASS](http://sass-lang.com/)
- [Normalize.css](https://necolas.github.io/normalize.css/)
- [BrowserSync](http://www.browsersync.io/)
- [Chrome Developer Tools](https://developer.chrome.com/devtools)

### Design

- [Foundation Icons](http://zurb.com/playground/foundation-icon-fonts-3)

### Libraries

- [jQuery](http://jquery.com/)
- [jQuery Throttle/Debounce](https://github.com/cowboy/jquery-throttle-debounce)
- [Moment.js](http://momentjs.com/)
- [URI.js](https://medialize.github.io/URI.js/)
- [Clipboard.js](https://zenorocha.github.io/clipboard.js/)


## Thanks

- [Justin Falcone](http://github.com/modernserf) and [Cody Robbins](http://github.com/codyrobbins) for code review


## License

- [MIT License](http://matthewmcvickar.mit-license.org/) © Matthew McVickar
