import React from "react";
import Header from "./Header";
import BottomNavbar from "./BottomNavbar";

interface NavbarProps {
  showSearchBar?: boolean;
  children?: React.ReactNode;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  showFilter?: boolean;
  onFilterClick?: () => void;
}

<<<<<<< HEAD
export default function Navbar({ 
  showSearchBar = false, 
  children, 
  searchQuery = "", 
  onSearchChange,
  showFilter = false,
  onFilterClick 
}: NavbarProps) {
  return (
    <>
      <Header 
=======
export default function Navbar({
  showSearchBar = false,
  children,
  searchQuery = "",
  onSearchChange,
  showFilter = false,
  onFilterClick
}: NavbarProps) {
  return (
    <>
      <Header
>>>>>>> ace37154b74ca81d6b98d7a167b33475f2748f4a
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        showFilter={showFilter}
        onFilterClick={onFilterClick}
      />
<<<<<<< HEAD
        
      {/* Optional Additional Content */}
      {showSearchBar && children && (
        <div className="px-4 pb-2 max-w-md md:max-w-lg lg:max-w-xl mx-auto">
=======

      {/* Optional Additional Content */}
      {showSearchBar && children && (
        <div className="px-4 pb-2">
>>>>>>> ace37154b74ca81d6b98d7a167b33475f2748f4a
          {children}
        </div>
      )}

      <BottomNavbar />
    </>
  );
}

