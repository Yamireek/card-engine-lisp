/* eslint-disable @typescript-eslint/no-explicit-any */

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
      actions: [],
    },
    back: {
      type: 'player_back',
      traits: [],
      sphere: [],
      abilities: [],
      actions: [],
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
      actions: [],
    },
    back: {
      type: 'player_back',
      traits: [],
      sphere: [],
      abilities: [],
      actions: [],
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
      actions: [],
    },
    back: {
      type: 'player_back',
      traits: [],
      sphere: [],
      abilities: [],
      actions: [],
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
      actions: [],
    },
    back: {
      type: 'player_back',
      traits: [],
      sphere: [],
      abilities: [],
      actions: [],
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
      actions: [],
    },
    back: {
      type: 'encounter_back',
      traits: [],
      sphere: [],
      abilities: [],
      actions: [],
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
      actions: [],
    },
    back: {
      type: 'encounter_back',
      traits: [],
      sphere: [],
      abilities: [],
      actions: [],
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
      actions: [],
    },
    back: {
      type: 'encounter_back',
      traits: [],
      sphere: [],
      abilities: [],
      actions: [],
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
      actions: [],
    },
    back: {
      name: nameB,
      sequence: props.sequence,
      type: 'quest',
      questPoints: props.b.questPoints,
      traits: [],
      sphere: [],
      abilities: [],
      actions: [],
    },
    orientation: 'landscape',
  };
}
