import React from "react";
import { Store, Settings, ShoppingCart, MessageCircle } from "lucide-react";

export default function ProfileHeader() {
  return (
    <div className="sticky top-0 z-20">
      <header 
        className="w-full relative overflow-hidden" 
        style={{
          background: 'linear-gradient(129deg, rgba(255, 140, 0, 1) 28%, rgba(255, 193, 7, 1) 100%)'
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
            {/* Toko Saya Button */}
            <button className="flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-sm font-medium text-slate-800 hover:bg-white transition-colors">
              <Store className="h-4 w-4" />
              <span>Toko Saya</span>
              <span className="text-slate-400">›</span>
            </button>

            {/* Action Icons */}
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
                <Settings className="h-5 w-5 text-white" />
              </button>
              
              <button className="relative p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
                <ShoppingCart className="h-5 w-5 text-white" />
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                  52
                </span>
              </button>
              
              <button className="relative p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
                <MessageCircle className="h-5 w-5 text-white" />
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                  56
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}
