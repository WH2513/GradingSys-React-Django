import { useState, useCallback } from "react";
import '../styles/modalMessage.css';

export function useModalMessage() {
  const [modal, setModal] = useState(null);

  const showModal = useCallback(
    ({ text, isError = false, actions = [] }) => {
      setModal({ text, isError, actions });
    },
    []
  );

  const hideModal = useCallback(() => setModal(null), []);

  const ModalMessage = () =>
    modal ? (
      <div className="modal-overlay">
        <div className="modal-box">
          <h4 className={modal.isError ? "modal-title error" : "modal-title"}>
            {modal.text}
          </h4>

          <div className="modal-actions">
            {modal.actions.map((action, i) => (
              <button
                key={i}
                className="modal-btn"
                onClick={() => {
                  action.onClick();
                  hideModal();
                }}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    ) : null;

  return { showModal, hideModal, ModalMessage };
}