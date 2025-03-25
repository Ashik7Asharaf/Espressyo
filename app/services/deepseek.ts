import { Creator, Post, Community, Feed } from '../types/feed';

const DEEPSEEK_API_URL = process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

interface DeepSeekResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export async function analyzeContent(content: string): Promise<DeepSeekResponse<any>> {
  try {
    const response = await fetch(`${DEEPSEEK_API_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error analyzing content:', error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

export async function getPersonalizedFeed(userId: string, cursor?: string): Promise<DeepSeekResponse<Feed>> {
  try {
    const response = await fetch(`${DEEPSEEK_API_URL}/feed/${userId}${cursor ? `?cursor=${cursor}` : ''}`, {
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching personalized feed:', error);
    return {
      success: false,
      data: { posts: [], hasMore: false },
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

export async function getCreatorRecommendations(userId: string): Promise<DeepSeekResponse<Creator[]>> {
  try {
    const response = await fetch(`${DEEPSEEK_API_URL}/recommendations/creators/${userId}`, {
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching creator recommendations:', error);
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

export async function getCommunityRecommendations(userId: string): Promise<DeepSeekResponse<Community[]>> {
  try {
    const response = await fetch(`${DEEPSEEK_API_URL}/recommendations/communities/${userId}`, {
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching community recommendations:', error);
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

export async function getTrendingPosts(): Promise<DeepSeekResponse<Post[]>> {
  try {
    const response = await fetch(`${DEEPSEEK_API_URL}/trending`, {
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching trending posts:', error);
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

export async function getSimilarContent(contentId: string): Promise<DeepSeekResponse<Post[]>> {
  try {
    const response = await fetch(`${DEEPSEEK_API_URL}/similar/${contentId}`, {
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching similar content:', error);
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
} 