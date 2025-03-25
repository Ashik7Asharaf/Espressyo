import { supabase } from '../lib/supabase';
import { Community, Event, CommunityPost, Location, CommunityFeed } from '../types/community';

const RADIUS_IN_KM = 50; // Default radius for nearby communities/events

export async function getNearbyEvents(
  location: Location,
  radius: number = RADIUS_IN_KM,
  cursor?: string,
  limit: number = 10
): Promise<{ events: Event[]; hasMore: boolean; nextCursor?: string }> {
  try {
    let query = supabase.rpc('get_nearby_events', {
      lat: location.latitude,
      lng: location.longitude,
      radius_km: radius,
      max_results: limit + 1
    });

    if (cursor) {
      query = query.lt('startDate', cursor);
    }

    const { data: events, error } = await query;

    if (error) throw error;

    const hasMore = events.length > limit;
    const nextCursor = hasMore ? events[limit - 1].startDate : undefined;

    return {
      events: events.slice(0, limit) as Event[],
      hasMore,
      nextCursor,
    };
  } catch (error) {
    console.error('Error fetching nearby events:', error);
    throw error;
  }
}

export async function getNearbyCommunities(
  location: Location,
  radius: number = RADIUS_IN_KM,
  cursor?: string,
  limit: number = 10
): Promise<{ communities: Community[]; hasMore: boolean; nextCursor?: string }> {
  try {
    let query = supabase.rpc('get_nearby_communities', {
      lat: location.latitude,
      lng: location.longitude,
      radius_km: radius,
      max_results: limit + 1
    });

    if (cursor) {
      query = query.lt('createdAt', cursor);
    }

    const { data: communities, error } = await query;

    if (error) throw error;

    const hasMore = communities.length > limit;
    const nextCursor = hasMore ? communities[limit - 1].createdAt : undefined;

    return {
      communities: communities.slice(0, limit) as Community[],
      hasMore,
      nextCursor,
    };
  } catch (error) {
    console.error('Error fetching nearby communities:', error);
    throw error;
  }
}

export async function getCommunityFeed(
  communityId: string,
  location?: Location,
  cursor?: string,
  limit: number = 10
): Promise<CommunityFeed> {
  try {
    let query = supabase
      .from('community_posts')
      .select('*')
      .eq('communityId', communityId)
      .order('createdAt', { ascending: false })
      .limit(limit + 1);

    if (cursor) {
      query = query.lt('createdAt', cursor);
    }

    const { data: posts, error } = await query;

    if (error) throw error;

    const hasMore = posts.length > limit;
    const nextCursor = hasMore ? posts[limit - 1].createdAt : undefined;

    return {
      posts: posts.slice(0, limit) as CommunityPost[],
      hasMore,
      nextCursor,
    };
  } catch (error) {
    console.error('Error fetching community feed:', error);
    throw error;
  }
}

export async function createEvent(event: Omit<Event, 'id' | 'currentAttendees' | 'createdAt'>): Promise<Event> {
  try {
    const { data: newEvent, error } = await supabase
      .from('events')
      .insert({
        ...event,
        currentAttendees: 0,
        createdAt: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return newEvent as Event;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
}

export async function createCommunityPost(
  post: Omit<CommunityPost, 'id' | 'likes' | 'comments' | 'createdAt'>
): Promise<CommunityPost> {
  try {
    const { data: newPost, error } = await supabase
      .from('community_posts')
      .insert({
        ...post,
        likes: 0,
        comments: 0,
        createdAt: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return newPost as CommunityPost;
  } catch (error) {
    console.error('Error creating community post:', error);
    throw error;
  }
}

export async function joinCommunity(
  userId: string,
  communityId: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('community_members')
      .insert({
        userId,
        communityId,
        role: 'member',
        joinedAt: new Date().toISOString(),
      });

    if (error) throw error;

    // Increment member count
    await supabase
      .from('communities')
      .update({ memberCount: supabase.raw('memberCount + 1') })
      .eq('id', communityId);
  } catch (error) {
    console.error('Error joining community:', error);
    throw error;
  }
}

export async function attendEvent(
  userId: string,
  eventId: string,
  status: 'going' | 'maybe' | 'not-going'
): Promise<void> {
  try {
    const { error } = await supabase
      .from('event_attendees')
      .upsert({
        userId,
        eventId,
        status,
        updatedAt: new Date().toISOString(),
      });

    if (error) throw error;

    if (status === 'going') {
      // Increment attendee count
      await supabase
        .from('events')
        .update({ currentAttendees: supabase.raw('currentAttendees + 1') })
        .eq('id', eventId);
    }
  } catch (error) {
    console.error('Error updating event attendance:', error);
    throw error;
  }
} 