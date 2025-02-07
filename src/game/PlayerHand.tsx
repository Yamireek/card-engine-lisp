import { useContext } from 'react';
import { DetailContext } from './DetailContext';
import { Player } from '@card-engine-lisp/engine';
import { HandLayout } from './HandLayout';
import { getCardImageUrl } from './utils';
import { observer } from 'mobx-react-lite';

export const PlayerHand = observer((props: { player: Player }) => {
  const detail = useContext(DetailContext);

  return (
    <HandLayout
      cards={props.player.hand.cards.map((card) => ({
        id: card.id,
        image: getCardImageUrl(card.def.front, 'front'),
        activable: false,
      }))}
      cardWidth={200}
      rotate={2}
      onOver={(id) => detail.setDetail(id)}
      onActivation={(id) => {
        // TOdO
        return;
      }}
    />
  );
});
