
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SendHorizonal, Plus, Loader2 } from 'lucide-react';
import { QuickSelectItem } from './QuickSelectItems';

interface ChatInputBarProps {
  onSubmit: (message: string) => Promise<void>;
  loading: boolean;
  quickSelectItems?: QuickSelectItem[];
}

const ChatInputBar = ({ onSubmit, loading, quickSelectItems }: ChatInputBarProps) => {
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || loading) return;
    
    await onSubmit(message.trim());
    setMessage('');
  };

  const handleQuickSelectClick = async (item: string) => {
    if (loading) return;
    await onSubmit(item);
  };

  return (
    <div className="border-t p-4">
      {quickSelectItems && quickSelectItems.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {quickSelectItems.map((item, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="animate-fade-in"
              onClick={() => handleQuickSelectClick(item.text)}
              disabled={loading}
            >
              {item.text}
            </Button>
          ))}
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <Button
          type="button"
          size="icon"
          variant="outline"
          className="h-10 w-10 shrink-0"
        >
          <Plus className="h-5 w-5" />
        </Button>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a food to log (e.g. '1 banana')"
          className="min-h-10 flex-1 resize-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          disabled={loading}
        />
        <Button
          type="submit"
          size="icon"
          disabled={!message.trim() || loading}
          className="h-10 w-10 shrink-0"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <SendHorizonal className="h-5 w-5" />
          )}
        </Button>
      </form>
    </div>
  );
};

export default ChatInputBar;
