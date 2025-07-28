# keybird

## TODO

## looping (maybe fixed)

well it seems indicative of a problem with applyPatternToChords function, too, right?

for example I could make a pattern that was just playing the T1 tone every other beat. the resulting performance SHOULD be the length of the chord progression, but with the pattern being applied to whatever chord notes are active in the progression at the onset time of the signal. If Mypattern is 32 beats long, which is 2 bars, but my progression is 4, then the pattern would play through 2 times, and be applied to all the chords...

If the pattern was 8, iut would just be duplicated in place 4 times in applyPatternToChords prior to actually applying to the chords, because it needs to cover the whole duration of the progression. does that make sense? We are not applying chords to a pattern. We are applying a pattern to a list of chords.

## Pattern Label boxes

The user should also be able to click on the label
boxes to the left of each row to play the note to sample it.

When the label box on the left of a row is clicked, not
only does it play that note for idk maybe like 1 second,
but it also selects all notes that are associated with that

## Fix frozen UI issues.

When initially rendering, the entire UI freezes for a few seconds
and then the chord blocks fall into that page harshly.

When performing an action that causes the chord browser to render
new chords, it causes the UI to freeze for a moment. This means the
select stays stuck open for a second after the section of a key or scaleType,
or when shuffling, the UI freezes for a second or two before the chords are replaced.

### RemainingKeymaps

- rightDown
- rightDownQuads
- rightDownTrios
- rightDownPairs
- rightUpQuads
- rightUpPairs
- leftDown
- leftDownQuads
- leftDownTrios
- leftDownPairs
- leftUp
- leftUpQuads
- leftUpTrios
- leftUpPairs

<!-- AIzaSyAfMqDb69qXZVHhQdPhWGUe7bRNZhd3zrg -->
