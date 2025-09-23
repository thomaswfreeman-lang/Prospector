// components/AIServiceButtons.tsx
import React from 'react';
import { ExternalLink, Zap, Search, Brain, MessageSquare } from 'lucide-react';

interface AIServiceButtonsProps {
  className?: string;
}

const AIServiceButtons = ({ className = "" }: AIServiceButtonsProps) => {
  const aiServices = [
    {
      name: 'ChatGPT',
      icon: MessageSquare,
      url: 'https://chat.openai.com',
      color: 'bg-green-600 hover:bg-green-700',
      description: 'GPT-4 for fire safety prospect research'
    },
    {
      name: 'Grok',
      icon: Zap,
      url: 'https://x.com/i/grok',
      color: 'bg-black hover:bg-gray-800',
      description: 'Real-time X/Twitter data for breaking opportunities'
    },
    {
      name: 'Perplexity',
      icon: Search,
      url: 'https://perplexity.ai',
      color: 'bg-blue-600 hover:bg-blue-700',
      description: 'AI research with real-time web access'
    },
    {
      name: 'Gemini',
      icon: Brain,
      url: 'https://gemini.google.com',
      color: 'bg-purple-600 hover:bg-purple-700',
      description: 'Google AI for research and analysis'
    }
  ];

  const openAIService = (service: typeof aiServices[0]) => {
    // Generate a fire safety specific query for each AI service
    const baseQuery = "Find recent fire safety testing equipment prospects, RFPs, grants, and opportunities. Focus on labs, universities, government entities needing cone calorimeters, smoke chambers, oxygen index testing, UL94 testing equipment. Include company names, contacts, locations, catalysts, and source links.";
    
    let serviceUrl = service.url;
    
    // Add service-specific query parameters if the service supports them
    if (service.name === 'ChatGPT') {
      // ChatGPT doesn't support URL parameters, but we'll open it anyway
      serviceUrl = service.url;
    } else if (service.name === 'Perplexity') {
      // Perplexity supports query parameters
      serviceUrl = `${service.url}/?q=${encodeURIComponent(baseQuery)}`;
    } else if (service.name === 'Gemini') {
      // Gemini doesn't support URL parameters in the same way
      serviceUrl = service.url;
    } else if (service.name === 'Grok') {
      // Grok (X) doesn't support direct query parameters
      serviceUrl = service.url;
    }
    
    window.open(serviceUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm font-medium text-gray-700 mr-1">AI Tools:</span>
      {aiServices.map((service) => {
        const IconComponent = service.icon;
        return (
          <button
            key={service.name}
            onClick={() => openAIService(service)}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-lg text-white text-sm font-medium 
              transition-all duration-200 transform hover:scale-105 shadow-sm
              ${service.color}
            `}
            title={service.description}
          >
            <IconComponent size={16} />
            {service.name}
            <ExternalLink size={12} className="opacity-75" />
          </button>
        );
      })}
    </div>
  );
};

export default AIServiceButtons;
