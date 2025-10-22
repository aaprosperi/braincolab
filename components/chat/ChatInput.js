import { useState, useRef, useEffect } from 'react';
import Button from '../ui/Button';
import Textarea from '../ui/Textarea';

const ChatInput = ({
  value,
  onChange,
  onSubmit,
  onVoiceInput,
  disabled = false,
  loading = false,
  listening = false,
}) => {
  const textareaRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled && !loading) {
        onSubmit();
      }
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [value]);

  return (
    <div className="bg-white border-t border-gray-200 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <Textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu mensaje o usa el micrófono..."
              className="max-h-32 overflow-y-auto"
              rows={1}
              disabled={disabled}
            />
          </div>

          <div className="flex items-center space-x-2 pb-3">
            {onVoiceInput && (
              <Button
                variant={listening ? 'danger' : 'ghost'}
                size="md"
                onClick={onVoiceInput}
                disabled={disabled || loading}
                className={listening ? 'animate-pulse' : ''}
                title={listening ? 'Escuchando...' : 'Entrada de voz'}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
              </Button>
            )}

            <Button
              variant="primary"
              size="md"
              onClick={onSubmit}
              disabled={!value.trim() || disabled || loading}
              loading={loading}
              title="Enviar mensaje"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </Button>
          </div>
        </div>

        <div className="mt-2 text-xs text-gray-500 text-center">
          Presiona Enter para enviar, Shift + Enter para nueva línea
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
