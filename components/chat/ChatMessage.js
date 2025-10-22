import Badge from '../ui/Badge';

const ChatMessage = ({ message }) => {
  const isUser = message.role === 'user';
  const isError = message.isError;

  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6 animate-fade-in`}
    >
      <div
        className={`max-w-[85%] sm:max-w-[75%] ${
          isUser
            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl rounded-tr-sm'
            : isError
            ? 'bg-red-50 border border-red-200 text-red-900 rounded-2xl rounded-tl-sm'
            : 'bg-white border border-gray-200 text-gray-900 rounded-2xl rounded-tl-sm shadow-sm'
        } px-5 py-3.5`}
      >
        {!isUser && message.model && (
          <div className="flex items-center space-x-2 mb-2 pb-2 border-b border-gray-200">
            <Badge variant="primary" size="sm">
              {message.model}
            </Badge>
            {message.cost && (
              <span className="text-xs text-gray-500">
                ${message.cost.toFixed(4)}
              </span>
            )}
          </div>
        )}
        <div className={`whitespace-pre-wrap ${isUser ? 'text-white' : isError ? 'text-red-900' : 'text-gray-800'}`}>
          {message.content}
          {message.isStreaming && (
            <span className="inline-block w-1 h-4 bg-current ml-1 animate-pulse" />
          )}
        </div>
        {message.timestamp && (
          <div
            className={`text-xs mt-2 pt-1 ${
              isUser ? 'text-blue-100' : 'text-gray-500'
            }`}
          >
            {new Date(message.timestamp).toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
