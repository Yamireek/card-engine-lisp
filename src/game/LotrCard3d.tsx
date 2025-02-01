import { useContext } from 'react';
import { StateContext } from '../game/StateContext';
import { Card3d } from './Card3d';
import { CardId } from '@card-engine-lisp/engine';
import { Dimensions, Vector3 } from './types';
import { getCardImageUrl } from './utils';
import { Token3d } from './Token3d';
import * as image from './../images';
import { useTextures } from './../images/textures';

export const LotrCard3d = (props: {
  cardId: CardId;
  position: Vector3;
  size: Dimensions;
}) => {
  const { game } = useContext(StateContext);
  const { texture } = useTextures();

  // const { floatingCards: cards } = useFloatingCards();
  //const cardActions = actions.filter((a) => a.card === props.cardId);

  const card = game.card[props.cardId];

  const textures = {
    front: texture[getCardImageUrl(card.def.front, 'front')],
    back: texture[getCardImageUrl(card.def.back, 'back')],
  };

  const orientation = card.def.orientation;

  return (
    <Card3d
      id={props.cardId}
      name={`card-${props.cardId}`}
      size={{
        width: props.size.width,
        height: props.size.height,
      }}
      position={props.position}
      rotation={[
        0,
        0,
        0, //card.tapped ? -Math.PI / 4 : card.shadowOf ? Math.PI / 3 : 0,
      ]}
      texture={
        card.up === 'front' || card.up === 'shadow'
          ? textures
          : { front: textures.back, back: textures.front }
      }
      orientation={orientation}
      //hidden={cards.some((c) => c.id === props.cardId)}
      onClick={() => {
        // if (
        //   cardActions.length === 0 ||
        //   !state.choice ||
        //   state.choice.type !== 'actions'
        // ) {
        //   return;
        // } else {
        //   if (cardActions.length === 1) {
        //     moves.action(indexOf(view.actions, cardActions[0]));
        //   } else {
        //     // tslint:disable-next-line:no-console
        //     console.log('todo multiple actions');
        //   }
        // }
      }}
    >
      <Token3d
        position={[0.022, 0.01]}
        texture={texture[image.resource]}
        amount={card.token.resource}
      />
      <Token3d
        position={[0, 0.01]}
        texture={texture[image.damage]}
        amount={card.token.damage}
      />
      <Token3d
        position={orientation === 'portrait' ? [0.01, 0.03] : [0.03, 0.01]}
        texture={texture[image.progress]}
        amount={card.token.progress}
      />
      {/* {cardActions.length > 0 && state.choice?.type === 'actions' && (
        <mesh>
          <planeGeometry
            attach="geometry"
            args={[cardSize.width * 1.03, cardSize.height * 1.03]}
          />
          <meshStandardMaterial attach="material" color="yellow" />
        </mesh>
      )} */}
    </Card3d>
  );
};
