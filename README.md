# [Yankees Sluggers Tracker](http://interactive.nydailynews.com/project/yankees-sluggers-tracker/)


## Production

### In-article widgets

Here's the new workflow for adding a Yankees Sluggers widget to an article:

1. Go to https://github.com/nydailynews/yankee-derby#in-article-widgets . That will take you to the part of the page where the markup is for each of the three widgets.
2. Choose which of the three widgets you want and triple-click the line with that markup.
3. You should have the line with the markup selected now. Copy it to your clipboard.
4. In SNAP, edit the article you want to add the widget to. Then:
    1. Create a new HTML embed.
    2. Paste the contents of your clipboard into the field.
    3. It should look something like this:```
<iframe id="sluggers-all" scrolling="no" style="width: 100%; height: 180px; border: 0;" src="http://interactive.nydailynews.com/project/yankees-sluggers-tracker/widget-sentence.html"></iframe>

<iframe id="sluggers-stanton" scrolling="no" style="width: 100%; height: 180px; border: 0;" src="http://interactive.nydailynews.com/project/yankees-sluggers-tracker/widget-sentence.html#stanton"></iframe>

<iframe id="sluggers-judge" scrolling="no" style="width: 100%; height: 180px; border: 0;" src="http://interactive.nydailynews.com/project/yankees-sluggers-tracker/widget-sentence.html#judge"></iframe>
```
## Credits

Emojis thanks to [twitter](http://twitter.github.io/twemoji/2/test/preview.html) and to [emoji-css](https://github.com/afeld/emoji-css).
