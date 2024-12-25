import { treachery } from "@card-engine-lisp/engine";

export const eyesOfTheForest = treachery(
  { name: 'Eyes of the Forest' },
  {
    description:
      'When Revealed: Each player discards all event cards in his hand.',
    whenRevealed: {
      card: { type: 'event', zoneType: 'hand' },
      action: 'discard',
    },
  }
);
