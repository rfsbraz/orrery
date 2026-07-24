import { Beside } from "./beside";
import { FullBleedVista } from "./full-bleed-vista";
import { Immersion } from "./immersion";
import { FloatingObject } from "./floating-object";
import { ArtifactSpread } from "./artifact-spread";
import { Diptych } from "./diptych";
import { Strip } from "./strip";
import { Marginalia } from "./marginalia";
import { Medallion } from "./medallion";
import { SplitCounterpoint } from "./split-counterpoint";
import { LayeredStack } from "./layered-stack";
import { Mosaic } from "./mosaic";
import { Interlude } from "./interlude";
import { Passage } from "./passage";
import { Epigraph } from "./epigraph";
import type { EventCardProps } from "./shared";

/**
 * The layout-grammar dispatcher (orrery-content docs/LAYOUT.md): one
 * component per `organisation`, chosen by the event's own field. This is
 * the entire point of splitting the grammar onto two axes - the app renders
 * VARIETY (which of these sixteen shapes a moment gets) while the generator
 * renders COHESION (VISUAL.md's uniform author style within whichever shape
 * is chosen).
 *
 * `chapter-gate` is the era-plate slot (see chapter-gate.tsx), not an event
 * organisation - river.tsx renders it directly against an `Era`, never
 * through this dispatcher. It is deliberately absent from the map below, so
 * an event that somehow carries `organisation: "chapter-gate"` (a content
 * bug; the validator should catch it before it ships) falls through to the
 * same safe default as any other unrecognised value: `beside`.
 */
const ORGANISATIONS: Record<string, React.ComponentType<EventCardProps>> = {
  beside: Beside,
  "full-bleed-vista": FullBleedVista,
  immersion: Immersion,
  "floating-object": FloatingObject,
  "artifact-spread": ArtifactSpread,
  diptych: Diptych,
  strip: Strip,
  marginalia: Marginalia,
  medallion: Medallion,
  "split-counterpoint": SplitCounterpoint,
  "layered-stack": LayeredStack,
  mosaic: Mosaic,
  interlude: Interlude,
  passage: Passage,
  epigraph: Epigraph,
};

export function RiverEventCard(props: EventCardProps) {
  const organisation = props.event.organisation ?? "beside";
  const Component = ORGANISATIONS[organisation] ?? Beside;
  return <Component {...props} />;
}
