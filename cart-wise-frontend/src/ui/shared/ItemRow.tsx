import { useState } from "react";
import type { SavedItem } from "@/shared/schemas";
import { formatPrice, formatStoreLabel, formatVariantLabel } from "@/ui/shared/format";
import { savedItemRepository } from "@/storage/saved-items";

type ItemRowProps = {
  item: SavedItem;
  showRemove?: boolean;
};

export function ItemRow({ item, showRemove = true }: ItemRowProps) {
  const [usePlaceholder, setUsePlaceholder] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [removing, setRemoving] = useState(false);
  const variant = formatVariantLabel(item.variant);
  const altText = item.name.slice(0, 120);

  const removeItem = () => {
    setRemoving(true);
    void savedItemRepository.remove(item.id).finally(() => {
      setRemoving(false);
      setConfirming(false);
    });
  };

  return (
    <article className="item-row">
      <div
        className="item-row__image"
        style={
          usePlaceholder
            ? { background: "#e0e0e0", width: 48, height: 48, borderRadius: 4 }
            : undefined
        }
      >
        {!usePlaceholder && (
          <img
            src={item.images[0]}
            alt={altText}
            width={48}
            height={48}
            onError={() => setUsePlaceholder(true)}
          />
        )}
      </div>
      <div className="item-row__body">
        <strong>{item.name}</strong>
        {variant ? <p className="item-row__variant">{variant}</p> : null}
        <p className="item-row__meta">
          {formatStoreLabel(item)} · {formatPrice(item.price.amount, item.price.currency)}
        </p>
        <a href={item.productUrl} target="_blank" rel="noreferrer">
          Abrir na loja
        </a>
        {showRemove ? (
          <div className="item-row__actions">
            {!confirming ? (
              <button type="button" className="link-button" onClick={() => setConfirming(true)}>
                Remover
              </button>
            ) : (
              <div className="item-row__confirm" role="dialog" aria-label="Confirmar remoção">
                <p>Remover este produto da lista?</p>
                <button type="button" onClick={removeItem} disabled={removing}>
                  Remover
                </button>
                <button type="button" onClick={() => setConfirming(false)} disabled={removing}>
                  Cancelar
                </button>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </article>
  );
}
