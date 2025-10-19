"use client";

import { useState } from "react";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import * as LucideIcons from "lucide-react";

interface IconPickerProps {
  currentIcon?: string;
  onSelect: (iconName: string) => void;
}

// Curated list of creative icons for diary entries and creative writing
const ICON_CATEGORIES: Record<string, string[]> = {
  "Nature": [
    "Flower", "Flower2", "Trees", "TreePine", "Sprout", "Leaf",
    "Sun", "Moon", "CloudRain", "Cloud", "CloudSnow", "Snowflake",
    "Waves", "Mountain", "Flame", "Sparkles", "Wind", "Rainbow"
  ],
  "Emotions & Love": [
    "Heart", "HeartHandshake", "HeartCrack", "Smile", "Frown", "Meh",
    "Laugh", "Angry", "PartyPopper", "Ghost", "Skull", "Eye",
    "ThumbsUp", "Peace", "Handshake", "MessageHeart", "SmilePlus", "Annoyed"
  ],
  "Creative & Art": [
    "Palette", "Brush", "Pen", "PenTool", "Feather", "Sparkle",
    "Wand", "Wand2", "Music", "Music2", "Guitar", "Headphones",
    "Camera", "Film", "Image", "Drama", "Mic", "BookOpen"
  ],
  "Mystical & Magic": [
    "Star", "Stars", "Sparkles", "Zap", "Crown", "Gem",
    "Diamond", "Circle", "Moon", "Sun", "Eclipse", "Orbit",
    "Atom", "Infinity", "Eye", "Ghost", "Skull", "Trophy"
  ],
  "Food & Drinks": [
    "Coffee", "Wine", "Beer", "Pizza", "Cake", "IceCream",
    "Apple", "Cherry", "Citrus", "Candy", "Cookie", "Soup",
    "Utensils", "UtensilsCrossed", "Martini", "Milk", "Flame", "Egg"
  ],
  "Travel & Places": [
    "Plane", "Ship", "Car", "Train", "Sailboat", "Anchor",
    "MapPin", "Map", "Compass", "Globe", "Home", "Hotel",
    "Building", "Church", "Castle", "Mountain", "Palmtree", "Island"
  ],
  "Animals": [
    "Bird", "Bug", "Cat", "Dog", "Fish", "Rabbit",
    "Squirrel", "Turtle", "Snail", "Beef", "Rat", "Egg"
  ],
  "Time & Seasons": [
    "Calendar", "CalendarDays", "Clock", "Timer", "Hourglass", "Sunrise",
    "Sunset", "SunMoon", "CloudSun", "CloudMoon", "Snowflake", "Sprout",
    "Leaf", "Flower", "Sun", "Moon", "Clock3", "Watch"
  ],
  "Objects & Symbols": [
    "Book", "BookMarked", "Bookmark", "Key", "Lock", "Gift",
    "Package", "Flag", "Bell", "Anchor", "Umbrella", "Glasses",
    "Watch", "Shirt", "Footprints", "Badge", "Shield", "Bike"
  ],
};

const DEFAULT_ICON = "FileText";

export function IconPicker({ currentIcon, onSelect }: IconPickerProps) {
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof ICON_CATEGORIES>("Nature");
  const displayIconName = currentIcon || DEFAULT_ICON;
  
  // Get the icon component dynamically
  const DisplayIcon = (LucideIcons as any)[displayIconName] || LucideIcons.FileText;

  return (
    <Popover className="relative">
      <PopoverButton className="hover:bg-hover rounded-lg p-2 transition-colors focus:outline-none group">
        <DisplayIcon size={48} className="text-gray-300 group-hover:text-white transition-colors" />
      </PopoverButton>

      <PopoverPanel
        transition
        anchor="bottom start"
        className="origin-top-left rounded-xl border border-white/5 bg-black/95 backdrop-blur-sm p-4 shadow-xl transition duration-100 ease-out [--anchor-gap:8px] focus:outline-none data-closed:scale-95 data-closed:opacity-0 z-50"
      >
        <div className="w-96">
          {/* Category tabs */}
          <div className="flex gap-1 mb-3 overflow-x-auto pb-2 scrollbar-thin">
            {Object.keys(ICON_CATEGORIES).map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category as keyof typeof ICON_CATEGORIES)}
                className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? "bg-white/20 text-white"
                    : "text-gray-400 hover:bg-white/10"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Icon grid */}
          <div className="grid grid-cols-6 gap-2 max-h-80 overflow-y-auto pr-2 scrollbar-thin">
            {ICON_CATEGORIES[selectedCategory].map((iconName) => {
              const IconComponent = (LucideIcons as any)[iconName];
              if (!IconComponent) return null;
              
              return (
                <PopoverButton
                  key={iconName}
                  onClick={() => onSelect(iconName)}
                  className="hover:bg-white/10 rounded-lg p-3 transition-colors cursor-pointer flex items-center justify-center group"
                  title={iconName}
                >
                  <IconComponent 
                    size={24} 
                    className="text-gray-400 group-hover:text-white transition-colors" 
                  />
                </PopoverButton>
              );
            })}
          </div>
        </div>
      </PopoverPanel>
    </Popover>
  );
}

