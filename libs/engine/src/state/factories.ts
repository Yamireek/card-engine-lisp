/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { CardDefinition } from './GameSetupData';
import {
  AllyProps,
  AttachmentProps,
  EnemyProps,
  EventProps,
  HeroProps,
  LocationProps,
  QuestDefinition,
  TreacheryProps,
} from './PrintedProps';

export function ally(
  props: Omit<AllyProps, 'type'>,
  ...abilities: any[]
): CardDefinition {
  return {
    front: {
      ...props,
      sphere: [props.sphere],
      type: 'ally',
    },
    back: {
      type: 'player_back',
      traits: [],
      sphere: [],
    },
    orientation: 'portrait',
  };
}

export function hero(
  props: Omit<HeroProps, 'type'>,
  ...abilities: any[]
): CardDefinition {
  return {
    front: {
      ...props,
      sphere: [props.sphere],
      type: 'hero',
    },
    back: {
      type: 'player_back',
      traits: [],
      sphere: [],
    },
    orientation: 'portrait',
  };
}

export function event(
  props: Omit<EventProps, 'type'>,
  ...abilities: any[]
): CardDefinition {
  return {
    front: {
      ...props,
      sphere: [props.sphere],
      traits: [],
      type: 'event',
    },
    back: {
      type: 'player_back',
      traits: [],
      sphere: [],
    },
    orientation: 'portrait',
  };
}

export function attachment(
  props: Omit<AttachmentProps, 'type'>,
  ...abilities: any[]
): CardDefinition {
  return {
    front: {
      ...props,
      sphere: [props.sphere],
      type: 'attachment',
    },
    back: {
      type: 'player_back',
      traits: [],
      sphere: [],
    },
    orientation: 'portrait',
  };
}

export function enemy(
  props: Omit<EnemyProps, 'type'>,
  ...abilities: any[]
): CardDefinition {
  return {
    front: {
      ...props,
      sphere: [],
      type: 'enemy',
    },
    back: {
      type: 'encounter_back',
      traits: [],
      sphere: [],
    },
    orientation: 'portrait',
  };
}

export function location(
  props: Omit<LocationProps, 'type'>,
  ...abilities: any[]
): CardDefinition {
  return {
    front: {
      ...props,
      sphere: [],
      type: 'location',
    },
    back: {
      type: 'encounter_back',
      traits: [],
      sphere: [],
    },
    orientation: 'portrait',
  };
}

export function treachery(
  props: Omit<TreacheryProps, 'type'>,
  ...abilities: any[]
): CardDefinition {
  return {
    front: {
      ...props,
      sphere: [],
      traits: [],
      type: 'treachery',
    },
    back: {
      type: 'encounter_back',
      traits: [],
      sphere: [],
    },
    orientation: 'portrait',
  };
}

export function quest(
  props: QuestDefinition,
  ...abilities: any[]
): CardDefinition {
  const nameA = props.name ?? props.a.name;
  const nameB = props.name ?? props.b.name;

  return {
    front: {
      name: nameA,
      sequence: props.sequence,
      type: 'quest',

      traits: [],
      sphere: [],
    },
    back: {
      name: nameB,
      sequence: props.sequence,
      type: 'quest',
      questPoints: props.b.questPoints,

      traits: [],
      sphere: [],
    },
    orientation: 'landscape',
  };
}
