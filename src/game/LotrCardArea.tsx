import { Fragment } from 'react';
import { cardSize } from './Card3d';
import { LotrCard3d } from './LotrCard3d';
import { CardAreaLayout, CardAreaLayoutProps } from './CardAreaLayout';
import { Card, Orientation } from '@card-engine-lisp/engine';

export const LotrCardArea = (props: {
  layout: Omit<CardAreaLayoutProps<Card>, 'itemSize' | 'items' | 'renderer'>;
  cards: Card[];
  orientation?: Orientation;
}) => {
  //  const { game } = useContext(StateContext);

  const items = props.cards; // TODO .filter((c) => !c.attachedTo && !c.shadowOf);

  const maxAttachments = 0; // TODO  max(items.map((i) => i.attachments.length)) ?? 0;

  const itemSize = {
    width: cardSize.width * 1.1,
    height: cardSize.height * (1.1 + maxAttachments * 0.2),
  };

  return (
    <CardAreaLayout
      {...props.layout}
      itemSize={itemSize}
      items={items}
      renderer={(p) => {
        const fullHeight = p.size.height;
        const scale = p.size.width / cardSize.width;
        const cardHeight = cardSize.height * scale;
        const offsetMin = -(fullHeight - cardHeight) / 2;
        // const offsetMax = (fullHeight - cardHeight) / 2;
        // TODO const diff = (offsetMax - offsetMin) / p.item.attachments.length;
        const realItemSize = {
          width: p.size.width / 1.1,
          height: p.size.height / 1.1,
        };

        return (
          <Fragment key={p.item.id}>
            <LotrCard3d
              cardId={p.item.id}
              position={[p.position[0], p.position[1] + offsetMin, 0]}
              size={realItemSize}
            />
            {/* {p.item.attachments.map((a, i) => {
              return (
                <LotrCard3d
                  key={a}
                  cardId={a}
                  size={realItemSize}
                  position={[
                    p.position[0],
                    p.position[1] + offsetMin + diff * (i + 1),
                    0.01 - (i + 1) * 0.001,
                  ]}
                />
              );
            })} */}
            {/* {p.item.shadows.map((a, i) => {
              return (
                <LotrCard3d
                  key={a}
                  cardId={a}
                  size={realItemSize}
                  position={[
                    p.position[0],
                    p.position[1] - 0.02 * (i + 1),
                    0.01 - (i + 1) * 0.001,
                  ]}
                />
              );
            })} */}
          </Fragment>
        );
      }}
    />
  );
};
