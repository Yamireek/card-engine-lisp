import { CardId } from '@card-engine-lisp/engine';
import { useContext } from 'react';
import { DetailContext } from './DetailContext';
import { StateContext } from './StateContext';
import { CardText } from './CardText';

const cardProperties = [
  'cost',
  'threat',
  'threatCost',
  'engagement',
  'willpower',
  'attack',
  'defense',
  'hitPoints',
  'sequence',
  'questPoints',
] as const;

export const CardDetail = (props: { cardId?: CardId }) => {
  const { game } = useContext(StateContext);
  const detail = useContext(DetailContext);

  const cardId = props.cardId ?? detail.cardId;

  if (!cardId) {
    return null;
  }

  const card = game.card[cardId];

  const name = card.definition.front.name ?? ''; // TODO
  const exhaused = false; // card.state.tapped ? 'E' : ''; // TODO
  const unique = card.definition.front.unique ? 'U' : ''; // TODO

  return (
    <CardText
      title={`${name} (${card.id}) [${exhaused}${unique}]`}
      sphere={card.definition.front.sphere}
      text={
        [] // TODO
        // card.sideUp !== 'shadow'
        //   ? card.definition[card.state.sideUp].abilities.map(
        //       (a) => a.description ?? ''
        //     )
        //   : card.view.rules.shadows?.map((s) => s.description) ?? []
      }
      attachments={[]}
      traits={card.definition.front.traits ?? []}
      properties={cardProperties.map((p) => ({
        name: p,
        printed: card.definition.front[p],
        current: card.definition.front[p], // TODO
      }))}
      tokens={card.token}
      keywords={card.definition.front.keywords ?? {}}
    />
  );
};
