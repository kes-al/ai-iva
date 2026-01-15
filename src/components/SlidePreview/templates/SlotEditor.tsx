'use client';

import { useState, useRef, useEffect } from 'react';

interface SlotEditorProps {
  slotId: string;
  value: string | null;
  placeholder: string;
  isEditable: boolean;
  onUpdate?: (slotId: string, value: string) => void;
  className?: string;
  multiline?: boolean;
}

export function SlotEditor({
  slotId,
  value,
  placeholder,
  isEditable,
  onUpdate,
  className = '',
  multiline = false,
}: SlotEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value || '');
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    if (onUpdate && localValue !== value) {
      onUpdate(slotId, localValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      handleBlur();
    }
    if (e.key === 'Escape') {
      setLocalValue(value || '');
      setIsEditing(false);
    }
  };

  if (!isEditable) {
    return (
      <div className={className}>
        {value || <span className="opacity-50">{placeholder}</span>}
      </div>
    );
  }

  if (isEditing) {
    const commonProps = {
      ref: inputRef as any,
      value: localValue,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setLocalValue(e.target.value),
      onBlur: handleBlur,
      onKeyDown: handleKeyDown,
      placeholder,
      className: `w-full bg-transparent border-b-2 border-white/30 focus:border-white focus:outline-none ${className}`,
    };

    return multiline ? (
      <textarea {...commonProps} rows={3} />
    ) : (
      <input type="text" {...commonProps} />
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className={`cursor-text hover:bg-white/10 rounded px-2 py-1 -mx-2 -my-1 transition-colors ${className}`}
    >
      {value || <span className="opacity-50">{placeholder}</span>}
    </div>
  );
}
