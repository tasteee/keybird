const promptSuffix = `
CREATIVITY: do not provide basic, generic, bland progressions.
give them character, color, and aim to come up
with unique or uncommon combinations. make use
of octaves, inversions, and voicings on each chord
in each progression (if you think necessary) to really
mix it up.

JUSTIFICATIONS: when it comes to your justifications,
please author them as though I know basially nothing
about music theory, so talk to me like a commoner,
not a musically inclined person. Basically ELI5 why
you selected that specific progression.

STRUCTURE: each object in the results array should represent
a chord progression. please provide a brief justification as
well as an array of chord objects that are shaped like so:
{ symbol: "F#m", octaveOffset: -1, inversion: 0, voicing: 'drop3', durationBeats: 4 }
(octaveOffset default is 0, inversion default is 0, voicing default is 'closed', durationBeats default is 4)
for durationBeats, try to add all the chords up to a total of 16 beats.

thank you! i love you.

---
Please create chord progressions based on the following requirements:
prompt: "creepy, aesthetic vibes like the used, but more geared towards dark-art-pop"
descriptors: "art pop, dark pop, McCabe, creepy, the used"
scale: "F# minor"
complexity: "any"
resultsCount: 10
`
