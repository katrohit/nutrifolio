
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { ChatMessage } from '@/types/chat';

export const useChat = () => {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Fetch chat history on component mount
    if (user) {
      fetchChatHistory();
    }
  }, [user]);

  const fetchChatHistory = async () => {
    if (!user) return;

    try {
      // Fetch all messages from the chat_messages table
      const { data, error } = await supabase
        .from('chat_messages')
        .select('id, message, response, is_user, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) {
        throw error;
      }

      // Format the data for our component
      if (data) {
        const formattedMessages: ChatMessage[] = data.map(item => ({
          id: item.id,
          message: item.message,
          response: item.response,
          isUser: item.is_user,
          createdAt: item.created_at,
        }));
        
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

  const handleSubmit = async (message: string) => {
    if (!message.trim() || !user) return;
    
    setLoading(true);
    
    try {
      // Get user's local timestamp for meal type inference
      const userTimestamp = new Date().toISOString();
      
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

      try {
        // Call the nutrition-assistant edge function with timestamp
        const { data: aiResponseData, error: aiError } = await supabase.functions.invoke('nutrition-assistant', {
          body: { 
            message: message.trim(), 
            userId: user.id,
            timestamp: userTimestamp
          }
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
        
        // Insert AI response as a separate message in the database
        const { data: aiMessageData, error: aiMessageError } = await supabase
          .from('chat_messages')
          .insert({
            user_id: user.id,
            message: aiResponseData.response,
            is_user: false,
          })
          .select('id, created_at')
          .single();

        if (aiMessageError) {
          console.error('Error storing AI message:', aiMessageError);
          throw aiMessageError;
        }
        
        // Add AI response to chat
        const aiMessage: ChatMessage = {
          id: aiMessageData!.id,
          message: aiResponseData.response,
          response: null,
          isUser: false,
          createdAt: aiMessageData!.created_at,
        };
        
        setChatHistory((prev) => [...prev, aiMessage]);

        // Display toast if food was logged
        if (aiResponseData.foodData) {
          toast({
            title: 'Food logged successfully',
            description: `Added ${aiResponseData.foodData.food_name} to your ${aiResponseData.foodData.meal_type.toLowerCase()}`,
          });
          
          // Trigger event for DailySummary to update
          window.dispatchEvent(new CustomEvent('food-log-updated'));
        }
      } catch (error) {
        console.error('Error calling nutrition assistant:', error);
        
        // Add a fallback AI response in case the edge function fails
        const fallbackResponse = "I'm having trouble processing your request right now. Please try again later.";
        
        // Update the existing message with the fallback response
        await supabase
          .from('chat_messages')
          .update({
            response: fallbackResponse,
          })
          .eq('id', messageData!.id);
        
        // Insert the fallback response as a system message
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('chat_messages')
          .insert({
            user_id: user.id,
            message: fallbackResponse,
            is_user: false,
          })
          .select('id, created_at')
          .single();
          
        if (!fallbackError && fallbackData) {
          const aiMessage: ChatMessage = {
            id: fallbackData.id,
            message: fallbackResponse,
            response: null,
            isUser: false,
            createdAt: fallbackData.created_at,
          };
          
          setChatHistory((prev) => [...prev, aiMessage]);
        }
        
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

  return {
    chatHistory,
    loading,
    handleSubmit,
  };
};
