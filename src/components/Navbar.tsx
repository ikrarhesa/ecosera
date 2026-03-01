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
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        showFilter={showFilter}
        onFilterClick={onFilterClick}
      />

      {/* Optional Additional Content */}
      {showSearchBar && children && (
        <div className="px-4 pb-2">
          {children}
        </div>
      )}

      <BottomNavbar />
    </>
  );
}

