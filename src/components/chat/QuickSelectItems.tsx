
import React from 'react';

export interface QuickSelectItem {
  text: string;
  category?: string;
}

export const generateQuickSelectItems = (message: string): QuickSelectItem[] => {
  // Empty array for initial greeting
  if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
    return [
      { text: 'Log breakfast' },
      { text: '1 banana' },
      { text: '2 eggs' },
      { text: 'Coffee with milk' }
    ];
  }
  
  // For food logging success, suggest related items
  if (message.toLowerCase().includes('logged')) {
    if (message.toLowerCase().includes('breakfast')) {
      return [
        { text: 'Coffee with milk' },
        { text: 'Orange juice' },
        { text: 'Toast with butter' }
      ];
    }
    if (message.toLowerCase().includes('lunch')) {
      return [
        { text: 'Soda' },
        { text: 'Iced tea' },
        { text: 'Salad' }
      ];
    }
    if (message.toLowerCase().includes('dinner')) {
      return [
        { text: 'Glass of wine' },
        { text: 'Ice cream' },
        { text: 'Herbal tea' }
      ];
    }
    
    // Default food-related suggestions
    return [
      { text: 'Glass of water' },
      { text: 'Coffee' },
      { text: 'Apple' }
    ];
  }
  
  // Default empty array if we can't generate contextual suggestions
  return [];
};
