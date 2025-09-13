import React from "react";
import { Search, MessageCircle, Filter } from "lucide-react";

interface HeaderProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  showFilter?: boolean;
  onFilterClick?: () => void;
}

export default function Header({ 
  searchQuery = "", 
  onSearchChange,
  showFilter = false,
  onFilterClick 
}: HeaderProps) {
  return (
    <div className="sticky top-0 z-20">
      <header 
        className="w-full relative overflow-hidden" 
        style={{
          background: 'linear-gradient(129deg, rgba(34, 84, 197, 1) 28%, rgba(69, 193, 255, 1) 100%)'
        }}
      >
        {/* Pattern Background */}
        <div 
          className="absolute inset-0 opacity-20 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("/images/header-pattern.svg")',
            backgroundSize: '50%'
          }}
        />
        {/* Content Layer */}
        <div className="relative z-10">
          <div className="px-4 pt-3 pb-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/images/ecosera-logo.svg" 
                alt="Ecosera Logo" 
                className="h-10 w-auto"
              />
            </div>
          </div>
          
          {/* Search Bar and Chat Icon Row */}
          <div className="px-4 pb-3 flex items-center gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                <Search className="h-4 w-4 text-slate-500" />
              </div>
              <input
                type="text"
                placeholder="Cari produk, kategori, atau merek..."
                value={searchQuery}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/90 backdrop-blur-sm border border-white/20 rounded-xl text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent relative z-0"
              />
            </div>
            
            {/* Filter Icon - only show when searching */}
            {showFilter && (
              <button 
                onClick={onFilterClick}
                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors flex-shrink-0"
              >
                <Filter className="h-5 w-5 text-white" />
              </button>
            )}
            
            {/* Chat Icon */}
            <button className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors flex-shrink-0">
              <MessageCircle className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>
      </header>
    </div>
  );
}
