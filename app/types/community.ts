import { Post } from './feed';

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  city: string;
  state?: string;
  country: string;
}

export interface Event {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  location: Location;
  startDate: string;
  endDate: string;
  type: 'public' | 'supporters-only';
  supportTier?: 'basic' | 'premium';
  maxAttendees?: number;
  currentAttendees: number;
  imageUrl?: string;
  price?: number;
  currency?: string;
  tags: string[];
  createdAt: string;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  location: Location;
  creatorIds: string[];
  memberCount: number;
  imageUrl?: string;
  tags: string[];
  type: 'public' | 'private';
  createdAt: string;
}

export interface CommunityMember {
  userId: string;
  communityId: string;
  role: 'admin' | 'moderator' | 'member';
  joinedAt: string;
}

export interface EventAttendee {
  userId: string;
  eventId: string;
  status: 'going' | 'maybe' | 'not-going';
  ticketId?: string;
  updatedAt: string;
}

export interface CommunityPost extends Post {
  communityId: string;
  location?: Location;
}

export interface CommunityFeed {
  posts: CommunityPost[];
  hasMore: boolean;
  nextCursor?: string;
} 