import { Wonder } from "../types";

export const WONDERS: Wonder[] = [
  { name: "alexandria", displayName: "The Lighthouse of Alexandria" },
  { name: "babylon", displayName: "The Hanging Gardens of Babylon" },
  { name: "colossus", displayName: "The Colossus of Rhodes" },
  { name: "ephesos", displayName: "The Temple of Artemis at Ephesus" },
  { name: "gizah", displayName: "The Great Pyramid of Giza" },
  { name: "halicarnassus", displayName: "The Mausoleum of Halicarnassus" },
  { name: "olympia", displayName: "The Statue of Zeus at Olympia" },
];

export const getWonderByName = (name: string): Wonder | undefined => {
  return WONDERS.find((wonder) => wonder.name === name);
};

export const isValidWonder = (name: string): boolean => {
  return WONDERS.some((wonder) => wonder.name === name);
};
