import type { ReactNode } from "react";
import { X } from "lucide-react";

type DialogProps = {
  title: string;
  children: ReactNode;
  onClose: () => void;
  danger?: boolean;
};

export function Dialog({ title, children, onClose, danger }: DialogProps) {
  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className={`dialog ${danger ? "dialog-danger" : ""}`} role="dialog" aria-modal="true" aria-labelledby="dialog-title">
        <div className="dialog-heading"><h2 id="dialog-title">{title}</h2><button className="icon-button" onClick={onClose} aria-label="Dialog schließen"><X /></button></div>
        {children}
      </section>
    </div>
  );
}
