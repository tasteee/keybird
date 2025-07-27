# TODO

- [ ] Tool mode actions
- [ ] Intersection of signals.

## Intersecting signals.

When the user drags / drops a signs and it either:

1. Completely covers the original signal: just erase the signal.
2. Partially covers one side of the original signal: shorten the signal by startDivision or endDivisioo.
3. Results in 2 edges of the original sticking out, break the original into 2.

### Add BPMController component to progressionpanel.

<BPMController /> should be a labeled text input (type number).
It should have label above, minus icon on left, plus icon on right, input in center.
step should be 10.
min should be 10.
max should be 300.

### Add velocity dropdown to progression panel.

When a chord is selected, there should be a dropdown
that allows you to change its minVelocity and maxVelocity.
The dropdown will look like a select (similar to InstrumentSelect
in CommonControls.tsx), its label will be `BPM: {chord.minVelocity}-{chord.maxVelicity}`.
When you click it, it will show a dropdown menu that one vertical range slider.
Moving the top handle changes maxVelocity, bottom changes minVelocity.
At the top it displays max velicty value, on bottom it displays min velocity.

### Add duplicate (copy) icon to progression panel.

When a step is selected, a duplicate icon should appear
with the other selected step related icons (trash, arrows, etc).

### The actual progressiongrid should scroll horizontally when necessary.

When the chords in the progression exceed 16 beats (or just naturally when
they dont fit in the 100% horizontal space anymore) then it should allow
the user to scroll horizontally to reveal chords that overflow.
