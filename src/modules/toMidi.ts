import MidiWriter from 'midi-writer-js'
import { Note } from 'tonal'

export const downloadProjectProgressionMidi = (project: ProjectT, progression: ProgressionT) => {
  const fileName = `${project.name}-${project.scaleSymbol}-${Date.now()}.mid` // Use project.scaleSymbol directly

  const TICKS_PER_BEAT = project.ppqResolution || 128 // Use project setting if present
  const track = new MidiWriter.Track()

  // Set tempo
  track.setTempo(project.bpm)

  let first = true

  progression.steps.forEach((chord) => {
    if (chord.isRest) {
      first = false
      return // Skip rests
    }

    const midiNotes = chord.notes
      .map(note => Note.midi(note))
      .filter(n => typeof n === "number") // remove nulls/non-founds

    const durationTicks = chord.durationBeats * TICKS_PER_BEAT

    const noteEvent = new MidiWriter.NoteEvent({
      pitch: midiNotes,
      duration: `T${durationTicks}`,
      velocity: Math.min(127, Math.max(0, chord.maxVelocity)),
      wait: first ? null : `T0`, // Don't wait extra before first note
    })

    // For subsequent chords, set wait to duration of previous chord (i.e. durationTicks).
    // However, midi-writer-js handles sequential events by default, so explicit "wait" is needed only if you have gaps/rests between chords.

    track.addEvent(noteEvent)
    first = false
  })

  // Generate the MIDI file
  const writer = new MidiWriter.Writer(track)
  const dataUri = writer.dataUri()

  // Trigger the download
  const link = document.createElement('a')
  link.href = dataUri
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
