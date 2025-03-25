import { supabase } from '../lib/supabase';
import { Post, Comment, Feed } from '../types/feed';

export async function getCreatorFeed(
  creatorId: string,
  cursor?: string,
  limit: number = 10
): Promise<Feed> {
  try {
    let query = supabase
      .from('posts')
      .select('*')
      .eq('creatorId', creatorId)
      .order('createdAt', { ascending: false })
      .limit(limit + 1); // Fetch one extra to check if there's more

    if (cursor) {
      query = query.lt('createdAt', cursor);
    }

    const { data: posts, error } = await query;

    if (error) throw error;

    const hasMore = posts.length > limit;
    const nextCursor = hasMore ? posts[limit - 1].createdAt : undefined;

    return {
      posts: posts.slice(0, limit) as Post[],
      hasMore,
      nextCursor,
    };
  } catch (error) {
    console.error('Error fetching creator feed:', error);
    throw error;
  }
}

export async function getSupportersFeed(
  userId: string,
  cursor?: string,
  limit: number = 10
): Promise<Feed> {
  try {
    // First get the list of creators the user supports
    const { data: supportedCreators, error: supportError } = await supabase
      .from('supporters')
      .select('creatorId, tier')
      .eq('userId', userId);

    if (supportError) throw supportError;

    if (!supportedCreators.length) {
      return { posts: [], hasMore: false };
    }

    // Get posts from supported creators
    let query = supabase
      .from('posts')
      .select('*')
      .in(
        'creatorId',
        supportedCreators.map((s) => s.creatorId)
      )
      .order('createdAt', { ascending: false })
      .limit(limit + 1);

    if (cursor) {
      query = query.lt('createdAt', cursor);
    }

    const { data: posts, error } = await query;

    if (error) throw error;

    // Filter posts based on support tier
    const filteredPosts = posts.filter((post) => {
      const support = supportedCreators.find((s) => s.creatorId === post.creatorId);
      if (!support) return false;
      if (post.type === 'public') return true;
      if (!post.supportTier) return true;
      return support.tier === 'premium' || post.supportTier === support.tier;
    });

    const hasMore = filteredPosts.length > limit;
    const nextCursor = hasMore ? filteredPosts[limit - 1].createdAt : undefined;

    return {
      posts: filteredPosts.slice(0, limit) as Post[],
      hasMore,
      nextCursor,
    };
  } catch (error) {
    console.error('Error fetching supporters feed:', error);
    throw error;
  }
}

export async function createPost(
  creatorId: string,
  content: string,
  type: 'public' | 'supporters-only',
  supportTier?: 'basic' | 'premium',
  mediaUrls?: string[]
): Promise<Post> {
  try {
    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        creatorId,
        content,
        type,
        supportTier,
        mediaUrls,
        createdAt: new Date().toISOString(),
        likes: 0,
        comments: 0,
      })
      .select()
      .single();

    if (error) throw error;
    return post as Post;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
}

export async function likePost(postId: string, userId: string): Promise<void> {
  try {
    const { error } = await supabase.from('post_likes').insert({
      postId,
      userId,
    });

    if (error) throw error;

    // Increment the likes count
    await supabase
      .from('posts')
      .update({ likes: supabase.raw('likes + 1') })
      .eq('id', postId);
  } catch (error) {
    console.error('Error liking post:', error);
    throw error;
  }
}

export async function unlikePost(postId: string, userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('post_likes')
      .delete()
      .eq('postId', postId)
      .eq('userId', userId);

    if (error) throw error;

    // Decrement the likes count
    await supabase
      .from('posts')
      .update({ likes: supabase.raw('likes - 1') })
      .eq('id', postId);
  } catch (error) {
    console.error('Error unliking post:', error);
    throw error;
  }
}

export async function addComment(
  postId: string,
  userId: string,
  content: string
): Promise<Comment> {
  try {
    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        postId,
        userId,
        content,
        createdAt: new Date().toISOString(),
        likes: 0,
      })
      .select()
      .single();

    if (error) throw error;

    // Increment the comments count on the post
    await supabase
      .from('posts')
      .update({ comments: supabase.raw('comments + 1') })
      .eq('id', postId);

    return comment as Comment;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
}

export async function getComments(
  postId: string,
  cursor?: string,
  limit: number = 10
): Promise<{ comments: Comment[]; hasMore: boolean; nextCursor?: string }> {
  try {
    let query = supabase
      .from('comments')
      .select('*')
      .eq('postId', postId)
      .order('createdAt', { ascending: false })
      .limit(limit + 1);

    if (cursor) {
      query = query.lt('createdAt', cursor);
    }

    const { data: comments, error } = await query;

    if (error) throw error;

    const hasMore = comments.length > limit;
    const nextCursor = hasMore ? comments[limit - 1].createdAt : undefined;

    return {
      comments: comments.slice(0, limit) as Comment[],
      hasMore,
      nextCursor,
    };
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
} 