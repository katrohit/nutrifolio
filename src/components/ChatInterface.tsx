
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SendHorizonal, Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

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

  const fetchChatHistory = async () => {
    try {
      // Fetch the last 15 messages from the chat_messages table
      const { data, error } = await supabase
        .from('chat_messages')
        .select('id, message, response, is_user, created_at')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: true })
        .limit(15);

      if (error) {
        throw error;
      }

      // Format the data for our component
      if (data) {
        setChatHistory(
          data.map((item) => ({
            id: item.id,
            message: item.message,
            response: item.response,
            isUser: item.is_user,
            createdAt: item.created_at,
          }))
        );
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
        id: messageData.id,
        message: message.trim(),
        response: null,
        isUser: true,
        createdAt: messageData.created_at,
      };
      
      setChatHistory((prev) => [...prev, userMessage]);
      setMessage('');

      // This would normally call an edge function to process the food logging
      // For now we'll simulate a response
      setTimeout(async () => {
        // In a real implementation, we would call an edge function here
        // that would use OpenAI to parse the food and return nutritional data
        
        const mockResponse = generateMockResponse(message.trim());
        
        // Update the chat message with the AI response
        const { error: updateError } = await supabase
          .from('chat_messages')
          .update({
            response: mockResponse,
          })
          .eq('id', messageData.id);
          
        if (updateError) throw updateError;
        
        // Add AI response to chat
        const aiMessage: ChatMessage = {
          id: messageData.id + '-response',
          message: mockResponse,
          response: null,
          isUser: false,
          createdAt: new Date().toISOString(),
        };
        
        setChatHistory((prev) => [...prev, aiMessage]);
        setLoading(false);
        
        // Simulate adding a food log entry
        // In a real implementation, the edge function would parse the food and create a food log entry
        if (message.toLowerCase().includes('banana') || 
            message.toLowerCase().includes('chicken') || 
            message.toLowerCase().includes('apple')) {
          // Add to food log - would come from AI in real app
          await addFoodLogEntry(message);
        }
      }, 1000);
      
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

  // Mock function to generate responses for demo
  const generateMockResponse = (userMessage: string) => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('banana')) {
      return "I've logged 1 medium banana (118g): 105 calories, 0.3g fat, 1.3g protein, 27g carbs";
    } else if (lowerMessage.includes('chicken')) {
      const weight = lowerMessage.match(/\d+g/) ? lowerMessage.match(/\d+g/)![0] : '100g';
      return `I've logged ${weight} of grilled chicken breast: 165 calories, 3.6g fat, 31g protein, 0g carbs`;
    } else if (lowerMessage.includes('apple')) {
      return "I've logged 1 medium apple (182g): 95 calories, 0.3g fat, 0.5g protein, 25g carbs";
    } else {
      return "I didn't recognize that food item. Please try again with a specific food and portion, like '1 banana' or '300g grilled chicken'";
    }
  };

  // Mock function to add a food log entry
  const addFoodLogEntry = async (userMessage: string) => {
    try {
      const now = new Date();
      let foodData = {
        user_id: user!.id,
        food_name: '',
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        meal_type: getMealTypeByTime(now),
        serving_size: '',
        serving_qty: 1,
        log_date: now.toISOString().split('T')[0]
      };
      
      const lowerMessage = userMessage.toLowerCase();
      
      if (lowerMessage.includes('banana')) {
        foodData = {
          ...foodData,
          food_name: 'Banana',
          calories: 105,
          protein: 1.3,
          carbs: 27,
          fat: 0.3,
          serving_size: 'medium (118g)',
        };
      } else if (lowerMessage.includes('chicken')) {
        const weight = lowerMessage.match(/\d+g/) 
          ? parseInt(lowerMessage.match(/\d+g/)![0]) 
          : 100;
          
        const multiplier = weight / 100;
        
        foodData = {
          ...foodData,
          food_name: 'Grilled Chicken Breast',
          calories: Math.round(165 * multiplier),
          protein: Math.round(31 * multiplier * 10) / 10,
          carbs: 0,
          fat: Math.round(3.6 * multiplier * 10) / 10,
          serving_size: `${weight}g`,
        };
      } else if (lowerMessage.includes('apple')) {
        foodData = {
          ...foodData,
          food_name: 'Apple',
          calories: 95,
          protein: 0.5,
          carbs: 25,
          fat: 0.3,
          serving_size: 'medium (182g)',
        };
      }
      
      await supabase.from('food_logs').insert(foodData);
      
      toast({
        title: 'Food logged successfully',
        description: `Added ${foodData.food_name} to your ${foodData.meal_type.toLowerCase()}`,
      });
      
    } catch (error) {
      console.error('Error adding food log:', error);
      toast({
        title: 'Failed to log food',
        description: 'There was an error saving your food log.',
        variant: 'destructive',
      });
    }
  };

  const getMealTypeByTime = (date: Date) => {
    const hour = date.getHours();
    
    if (hour >= 5 && hour < 10) return 'Breakfast';
    if (hour >= 10 && hour < 12) return 'Morning Snack';
    if (hour >= 12 && hour < 15) return 'Lunch';
    if (hour >= 15 && hour < 18) return 'Afternoon Snack';
    if (hour >= 18 && hour < 21) return 'Dinner';
    return 'Evening Snack';
  };
  
  return (
    <div className="flex h-full flex-col rounded-lg border bg-white shadow-sm">
      {/* Chat history */}
      <div className="chat-scrollbar flex flex-1 flex-col gap-4 overflow-y-auto p-4">
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
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    chat.isUser
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  {chat.message}
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
            <SendHorizonal className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
