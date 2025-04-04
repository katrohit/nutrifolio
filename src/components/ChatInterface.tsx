
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SendHorizonal, Plus, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';

type ChatMessage = {
  id: string;
  message: string;
  response: string | null;
  isUser: boolean;
  createdAt: string;
};

const ChatInterface = () => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    // Fetch chat history on component mount
    if (user) {
      fetchChatHistory();
    }
  }, [user]);

  useEffect(() => {
    // Scroll to bottom when chat history changes
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // Handle keyboard showing on mobile
  useEffect(() => {
    const handleResize = () => {
      if (chatContainerRef.current && bottomRef.current) {
        bottomRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchChatHistory = async () => {
    if (!user) return;

    try {
      // Fetch the last 15 messages from the chat_messages table
      const { data, error } = await supabase
        .from('chat_messages')
        .select('id, message, response, is_user, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(30);

      if (error) {
        throw error;
      }

      // Format the data for our component
      if (data) {
        const formattedMessages: ChatMessage[] = [];
        
        data.forEach(item => {
          // Add user message
          formattedMessages.push({
            id: item.id,
            message: item.message,
            response: null,
            isUser: true,
            createdAt: item.created_at,
          });
          
          // Add assistant response if it exists
          if (item.response) {
            formattedMessages.push({
              id: `${item.id}-response`,
              message: item.response,
              response: null,
              isUser: false,
              createdAt: item.created_at,
            });
          }
        });
        
        setChatHistory(formattedMessages);
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
      toast({
        title: 'Failed to load chat history',
        description: 'Please try refreshing the page.',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !user) return;
    
    setLoading(true);
    
    try {
      // Insert user message to DB
      const { data: messageData, error: messageError } = await supabase
        .from('chat_messages')
        .insert({
          user_id: user.id,
          message: message.trim(),
          is_user: true,
        })
        .select('id, created_at')
        .single();

      if (messageError) throw messageError;

      // Add user message to chat
      const userMessage: ChatMessage = {
        id: messageData!.id,
        message: message.trim(),
        response: null,
        isUser: true,
        createdAt: messageData!.created_at,
      };
      
      setChatHistory((prev) => [...prev, userMessage]);
      setMessage('');

      try {
        // Call the nutrition-assistant edge function
        const { data: aiResponseData, error: aiError } = await supabase.functions.invoke('nutrition-assistant', {
          body: { message: message.trim(), userId: user.id }
        });
        
        if (aiError) throw aiError;

        // Update the chat message with the AI response
        const { error: updateError } = await supabase
          .from('chat_messages')
          .update({
            response: aiResponseData.response,
          })
          .eq('id', messageData!.id);
          
        if (updateError) throw updateError;
        
        // Add AI response to chat
        const aiMessage: ChatMessage = {
          id: messageData!.id + '-response',
          message: aiResponseData.response,
          response: null,
          isUser: false,
          createdAt: new Date().toISOString(),
        };
        
        setChatHistory((prev) => [...prev, aiMessage]);

        // Display toast if food was logged
        if (aiResponseData.foodData) {
          toast({
            title: 'Food logged successfully',
            description: `Added ${aiResponseData.foodData.food_name} to your ${aiResponseData.foodData.meal_type.toLowerCase()}`,
          });
        }
      } catch (error) {
        console.error('Error calling nutrition assistant:', error);
        
        // Add a fallback AI response in case the edge function fails
        const fallbackResponse = "I'm having trouble processing your request right now. Please try again later.";
        
        await supabase
          .from('chat_messages')
          .update({
            response: fallbackResponse,
          })
          .eq('id', messageData!.id);
        
        const aiMessage: ChatMessage = {
          id: messageData!.id + '-response',
          message: fallbackResponse,
          response: null,
          isUser: false,
          createdAt: new Date().toISOString(),
        };
        
        setChatHistory((prev) => [...prev, aiMessage]);
        
        toast({
          title: 'Error',
          description: 'Failed to process your message',
          variant: 'destructive',
        });
      }
      
      setLoading(false);
      
    } catch (error) {
      console.error('Error sending message:', error);
      setLoading(false);
      toast({
        title: 'Failed to send message',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    try {
      return format(new Date(timestamp), 'h:mm a');
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return '';
    }
  };
  
  return (
    <div className="flex h-full flex-col rounded-lg border bg-white shadow-sm">
      {/* Chat history */}
      <div ref={chatContainerRef} className="chat-scrollbar flex flex-1 flex-col gap-4 overflow-y-auto p-4">
        {chatHistory.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center text-muted-foreground">
            <p className="mb-2">No messages yet</p>
            <p className="text-sm">
              Try adding something like "1 banana" or "300g grilled chicken"
            </p>
          </div>
        ) : (
          <>
            {chatHistory.map((chat) => (
              <div
                key={chat.id}
                className={`flex w-full ${
                  chat.isUser ? 'justify-end' : 'justify-start'
                }`}
              >
                <div className="flex flex-col">
                  <div
                    className={`max-w-[300px] rounded-lg px-4 py-2 ${
                      chat.isUser
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    {chat.message}
                  </div>
                  <div className={`mt-1 text-xs text-muted-foreground ${
                    chat.isUser ? 'text-right' : 'text-left'
                  }`}>
                    {formatTimestamp(chat.createdAt)}
                  </div>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Input area */}
      <div className="border-t p-4">
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
    </div>
  );
};

export default ChatInterface;
