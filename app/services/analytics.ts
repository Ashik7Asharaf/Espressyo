import { Post, Creator, Community } from '../types/feed';

interface AnalyticsEvent {
  eventName: string;
  timestamp: string;
  userId?: string;
  properties?: Record<string, any>;
}

interface PageView {
  pageName: string;
  timestamp: string;
  userId?: string;
  duration?: number;
}

interface UserAction {
  actionType: string;
  timestamp: string;
  userId: string;
  targetId?: string;
  properties?: Record<string, any>;
}

class AnalyticsService {
  private static instance: AnalyticsService;
  private events: AnalyticsEvent[] = [];
  private pageViews: PageView[] = [];
  private userActions: UserAction[] = [];
  private readonly MAX_EVENTS = 1000;
  private readonly FLUSH_INTERVAL = 5 * 60 * 1000; // 5 minutes

  private constructor() {
    // Start periodic flush
    setInterval(() => this.flush(), this.FLUSH_INTERVAL);
  }

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  // Event Tracking
  public trackEvent(eventName: string, userId?: string, properties?: Record<string, any>): void {
    const event: AnalyticsEvent = {
      eventName,
      timestamp: new Date().toISOString(),
      userId,
      properties,
    };

    this.events.push(event);
    this.checkAndFlush();
  }

  // Page View Tracking
  public trackPageView(pageName: string, userId?: string, duration?: number): void {
    const pageView: PageView = {
      pageName,
      timestamp: new Date().toISOString(),
      userId,
      duration,
    };

    this.pageViews.push(pageView);
    this.checkAndFlush();
  }

  // User Action Tracking
  public trackUserAction(actionType: string, userId: string, targetId?: string, properties?: Record<string, any>): void {
    const action: UserAction = {
      actionType,
      timestamp: new Date().toISOString(),
      userId,
      targetId,
      properties,
    };

    this.userActions.push(action);
    this.checkAndFlush();
  }

  // Content Engagement Tracking
  public trackContentEngagement(
    userId: string,
    contentId: string,
    contentType: 'post' | 'creator' | 'community',
    action: 'view' | 'like' | 'comment' | 'share'
  ): void {
    this.trackUserAction(
      `${contentType}_${action}`,
      userId,
      contentId,
      { contentType, action }
    );
  }

  // Creator Analytics
  public trackCreatorMetrics(creatorId: string, metrics: {
    followerCount: number;
    postCount: number;
    engagementRate: number;
    revenue: number;
  }): void {
    this.trackEvent('creator_metrics', creatorId, metrics);
  }

  // Community Analytics
  public trackCommunityMetrics(communityId: string, metrics: {
    memberCount: number;
    postCount: number;
    activeUsers: number;
    engagementRate: number;
  }): void {
    this.trackEvent('community_metrics', communityId, metrics);
  }

  // User Journey Tracking
  public trackUserJourney(userId: string, step: string, properties?: Record<string, any>): void {
    this.trackEvent('user_journey', userId, { step, ...properties });
  }

  // Error Tracking
  public trackError(error: Error, userId?: string, context?: Record<string, any>): void {
    this.trackEvent('error', userId, {
      errorName: error.name,
      errorMessage: error.message,
      stackTrace: error.stack,
      ...context,
    });
  }

  // Performance Tracking
  public trackPerformance(metric: string, value: number, userId?: string, context?: Record<string, any>): void {
    this.trackEvent('performance', userId, {
      metric,
      value,
      ...context,
    });
  }

  private checkAndFlush(): void {
    if (this.events.length >= this.MAX_EVENTS) {
      this.flush();
    }
  }

  private async flush(): Promise<void> {
    try {
      // Here you would typically send the data to your analytics service
      // For example, Google Analytics, Mixpanel, or your own backend
      console.log('Flushing analytics data:', {
        events: this.events.length,
        pageViews: this.pageViews.length,
        userActions: this.userActions.length,
      });

      // Clear the arrays after successful flush
      this.events = [];
      this.pageViews = [];
      this.userActions = [];
    } catch (error) {
      console.error('Error flushing analytics data:', error);
      // Implement retry logic or error handling as needed
    }
  }

  // Analytics Reports
  public async getCreatorReport(creatorId: string, startDate: Date, endDate: Date): Promise<any> {
    // Implement creator report generation
    return {
      totalFollowers: 0,
      engagementRate: 0,
      topPosts: [],
      revenueMetrics: {},
    };
  }

  public async getCommunityReport(communityId: string, startDate: Date, endDate: Date): Promise<any> {
    // Implement community report generation
    return {
      memberGrowth: 0,
      engagementMetrics: {},
      topContributors: [],
      contentMetrics: {},
    };
  }

  public async getUserReport(userId: string, startDate: Date, endDate: Date): Promise<any> {
    // Implement user report generation
    return {
      engagementHistory: [],
      favoriteContent: [],
      interactionMetrics: {},
      journeyProgress: {},
    };
  }
}

export const analytics = AnalyticsService.getInstance(); 