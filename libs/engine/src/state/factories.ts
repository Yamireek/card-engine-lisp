/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Ability, CardDefinition } from './GameSetupData';
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
      abilities,
    },
    back: {
      type: 'player_back',
      traits: [],
      sphere: [],
      abilities: [],
    },
    orientation: 'portrait',
  };
}

export function hero(
  props: Omit<HeroProps, 'type' | 'unique'>,
  ...abilities: Ability[]
): CardDefinition {
  return {
    front: {
      ...props,
      sphere: [props.sphere],
      type: 'hero',
      unique: true,
      abilities,
    },
    back: {
      type: 'player_back',
      traits: [],
      sphere: [],
      abilities: [],
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
      abilities,
    },
    back: {
      type: 'player_back',
      traits: [],
      sphere: [],
      abilities: [],
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
      abilities,
    },
    back: {
      type: 'player_back',
      traits: [],
      sphere: [],
      abilities: [],
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
      abilities,
    },
    back: {
      type: 'encounter_back',
      traits: [],
      sphere: [],
      abilities: [],
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
      abilities,
    },
    back: {
      type: 'encounter_back',
      traits: [],
      sphere: [],
      abilities: [],
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
      abilities,
    },
    back: {
      type: 'encounter_back',
      traits: [],
      sphere: [],
      abilities: [],
    },
    orientation: 'portrait',
  };
}

export function quest(props: QuestDefinition): CardDefinition {
  const nameA = props.name ?? props.a.name;
  const nameB = props.name ?? props.b.name;

  return {
    front: {
      name: nameA,
      sequence: props.sequence,
      type: 'quest',
      traits: [],
      sphere: [],
      abilities: [],
    },
    back: {
      name: nameB,
      sequence: props.sequence,
      type: 'quest',
      questPoints: props.b.questPoints,
      traits: [],
      sphere: [],
      abilities: [],
    },
    orientation: 'landscape',
  };
}
