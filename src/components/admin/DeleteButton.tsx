"use client";

import { useState, useRef } from "react";
import ConfirmModal from "./ConfirmModal";

export default function DeleteButton({
  action,
  entityId,
  entityName,
  entityType,
  extraFields,
}: Readonly<{
  action: (formData: FormData) => void;
  entityId: string;
  entityName: string;
  entityType: string;
  extraFields?: Record<string, string>;
}>) {
  const [showModal, setShowModal] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <>
      <form ref={formRef} action={action}>
        <input type="hidden" name="id" value={entityId} />
        {extraFields &&
          Object.entries(extraFields).map(([key, value]) => (
            <input key={key} type="hidden" name={key} value={value} />
          ))}
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="bg-red-50 text-red-600 border border-red-200 rounded-lg px-4 py-2 text-sm font-medium hover:bg-red-100 transition-colors"
        >
          Delete {entityType}
        </button>
      </form>

      <ConfirmModal
        open={showModal}
        title={`Delete ${entityType}`}
        message={`Delete "${entityName}"? This cannot be undone.`}
        confirmLabel={`Delete ${entityType}`}
        onConfirm={() => {
          setShowModal(false);
          formRef.current?.requestSubmit();
        }}
        onCancel={() => setShowModal(false)}
      />
    </>
  );
}
