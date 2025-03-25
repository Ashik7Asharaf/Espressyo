export interface Post {
  id: string;
  creatorId: string;
  creator?: Creator;
  content: string;
  mediaUrls?: string[];
  type: 'text' | 'image' | 'video' | 'poll' | 'event';
  supportTier?: string;
  createdAt: string;
  likes: number;
  comments: Comment[];
  isLiked: boolean;
  poll?: {
    question: string;
    options: string[];
    endDate: string;
    votes: Record<string, number>;
  };
  event?: {
    title: string;
    description: string;
    date: string;
    location: string;
    attendees: string[];
    maxAttendees: number;
  };
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: string;
  likes: number;
  isLiked: boolean;
  replies?: Comment[];
}

export interface Creator {
  id: string;
  name: string;
  avatar: string;
  bio?: string;
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    youtube?: string;
  };
  supporterCount: number;
  postCount: number;
  isSupported: boolean;
  supportTiers?: SupportTier[];
}

export interface SupportTier {
  id: string;
  name: string;
  price: number;
  currency: string;
  benefits: string[];
  supporterCount: number;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface Poll {
  question: string;
  options: PollOption[];
  endDate: string;
  totalVotes: number;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  imageUrl?: string;
  price?: number;
  currency?: string;
  attendees: number;
  maxAttendees?: number;
  isAttending: boolean;
  organizer: Creator;
  tags: string[];
}

export interface Feed {
  posts: Post[];
  hasMore: boolean;
  nextCursor?: string;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  memberCount: number;
  isMember: boolean;
  tags: string[];
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  events?: Event[];
}

export interface DeepSeekResponse {
  success: boolean;
  data: {
    recommendations: Creator[];
    trendingCreators: Creator[];
    suggestedCommunities: Community[];
    personalizedFeed: Post[];
  };
} 