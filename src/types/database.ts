export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ContentStatus = 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';
export type UserRole = 'READER' | 'WRITER' | 'EDITOR' | 'ADMIN';
export type PlanTier = 'FREE' | 'PRO' | 'ENTERPRISE';
export type CommentStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'DELETED';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: UserRole;
          avatar: string | null;
          plan: PlanTier;
          bio: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          role?: UserRole;
          avatar?: string | null;
          plan?: PlanTier;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          role?: UserRole;
          avatar?: string | null;
          plan?: PlanTier;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey';
            columns: ['id'];
            referencedRelation: 'users';
            referencedSchema: 'auth';
          }
        ];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          color: string;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          color?: string;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          color?: string;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      articles: {
        Row: {
          id: string;
          type: string;
          title: string;
          slug: string;
          summary: string;
          body: string;
          source_name: string | null;
          source_url: string | null;
          source_author: string | null;
          category_id: string;
          author_id: string | null;
          cover_image: string | null;
          photo_credit: string | null;
          read_time_minutes: number;
          word_count: number;
          status: ContentStatus;
          is_featured: boolean;
          is_trending: boolean;
          scheduled_for: string | null;
          published_at: string | null;
          view_count: number;
          like_count: number;
          seo_title: string | null;
          seo_description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          type?: string;
          title: string;
          slug: string;
          summary: string;
          body: string;
          source_name?: string | null;
          source_url?: string | null;
          source_author?: string | null;
          category_id: string;
          author_id?: string | null;
          cover_image?: string | null;
          photo_credit?: string | null;
          read_time_minutes?: number;
          word_count?: number;
          status?: ContentStatus;
          is_featured?: boolean;
          is_trending?: boolean;
          scheduled_for?: string | null;
          published_at?: string | null;
          view_count?: number;
          like_count?: number;
          seo_title?: string | null;
          seo_description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          type?: string;
          title?: string;
          slug?: string;
          summary?: string;
          body?: string;
          source_name?: string | null;
          source_url?: string | null;
          source_author?: string | null;
          category_id?: string;
          author_id?: string | null;
          cover_image?: string | null;
          photo_credit?: string | null;
          read_time_minutes?: number;
          word_count?: number;
          status?: ContentStatus;
          is_featured?: boolean;
          is_trending?: boolean;
          scheduled_for?: string | null;
          published_at?: string | null;
          view_count?: number;
          like_count?: number;
          seo_title?: string | null;
          seo_description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'articles_category_id_fkey';
            columns: ['category_id'];
            referencedRelation: 'categories';
            referencedSchema: 'public';
          },
          {
            foreignKeyName: 'articles_author_id_fkey';
            columns: ['author_id'];
            referencedRelation: 'profiles';
            referencedSchema: 'public';
          }
        ];
      };
      blog_posts: {
        Row: {
          id: string;
          title: string;
          slug: string;
          excerpt: string;
          body: string;
          cover_image: string | null;
          author_id: string | null;
          category_id: string;
          read_time_minutes: number;
          status: ContentStatus;
          published_at: string | null;
          view_count: number;
          like_count: number;
          seo_title: string | null;
          seo_description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          excerpt: string;
          body: string;
          cover_image?: string | null;
          author_id?: string | null;
          category_id: string;
          read_time_minutes?: number;
          status?: ContentStatus;
          published_at?: string | null;
          view_count?: number;
          like_count?: number;
          seo_title?: string | null;
          seo_description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          excerpt?: string;
          body?: string;
          cover_image?: string | null;
          author_id?: string | null;
          category_id?: string;
          read_time_minutes?: number;
          status?: ContentStatus;
          published_at?: string | null;
          view_count?: number;
          like_count?: number;
          seo_title?: string | null;
          seo_description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'blog_posts_category_id_fkey';
            columns: ['category_id'];
            referencedRelation: 'categories';
            referencedSchema: 'public';
          },
          {
            foreignKeyName: 'blog_posts_author_id_fkey';
            columns: ['author_id'];
            referencedRelation: 'profiles';
            referencedSchema: 'public';
          }
        ];
      };
      case_studies: {
        Row: {
          id: string;
          title: string;
          slug: string;
          company: string;
          company_logo: string | null;
          valuation: string | null;
          stage: string | null;
          key_metric: string | null;
          summary: string;
          challenge: string | null;
          strategy: string | null;
          outcome: string | null;
          body: string;
          cover_image: string | null;
          category_id: string;
          author_id: string | null;
          read_time_minutes: number;
          status: ContentStatus;
          published_at: string | null;
          view_count: number;
          like_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          company: string;
          company_logo?: string | null;
          valuation?: string | null;
          stage?: string | null;
          key_metric?: string | null;
          summary: string;
          challenge?: string | null;
          strategy?: string | null;
          outcome?: string | null;
          body: string;
          cover_image?: string | null;
          category_id: string;
          author_id?: string | null;
          read_time_minutes?: number;
          status?: ContentStatus;
          published_at?: string | null;
          view_count?: number;
          like_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          company?: string;
          company_logo?: string | null;
          valuation?: string | null;
          stage?: string | null;
          key_metric?: string | null;
          summary?: string;
          challenge?: string | null;
          strategy?: string | null;
          outcome?: string | null;
          body?: string;
          cover_image?: string | null;
          category_id?: string;
          author_id?: string | null;
          read_time_minutes?: number;
          status?: ContentStatus;
          published_at?: string | null;
          view_count?: number;
          like_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'case_studies_category_id_fkey';
            columns: ['category_id'];
            referencedRelation: 'categories';
            referencedSchema: 'public';
          },
          {
            foreignKeyName: 'case_studies_author_id_fkey';
            columns: ['author_id'];
            referencedRelation: 'profiles';
            referencedSchema: 'public';
          }
        ];
      };
      likes: {
        Row: {
          id: string;
          article_id: string | null;
          case_study_id: string | null;
          blog_post_id: string | null;
          profile_id: string | null;
          ip_hash: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          article_id?: string | null;
          case_study_id?: string | null;
          blog_post_id?: string | null;
          profile_id?: string | null;
          ip_hash?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          article_id?: string | null;
          case_study_id?: string | null;
          blog_post_id?: string | null;
          profile_id?: string | null;
          ip_hash?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'likes_article_id_fkey';
            columns: ['article_id'];
            referencedRelation: 'articles';
            referencedSchema: 'public';
          },
          {
            foreignKeyName: 'likes_case_study_id_fkey';
            columns: ['case_study_id'];
            referencedRelation: 'case_studies';
            referencedSchema: 'public';
          },
          {
            foreignKeyName: 'likes_blog_post_id_fkey';
            columns: ['blog_post_id'];
            referencedRelation: 'blog_posts';
            referencedSchema: 'public';
          },
          {
            foreignKeyName: 'likes_profile_id_fkey';
            columns: ['profile_id'];
            referencedRelation: 'profiles';
            referencedSchema: 'public';
          }
        ];
      };
      bookmarks: {
        Row: {
          id: string;
          profile_id: string;
          article_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          article_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          article_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'bookmarks_profile_id_fkey';
            columns: ['profile_id'];
            referencedRelation: 'profiles';
            referencedSchema: 'public';
          },
          {
            foreignKeyName: 'bookmarks_article_id_fkey';
            columns: ['article_id'];
            referencedRelation: 'articles';
            referencedSchema: 'public';
          }
        ];
      };
      comments: {
        Row: {
          id: string;
          entity_type: string;
          entity_id: string;
          profile_id: string | null;
          body: string;
          status: CommentStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          entity_type?: string;
          entity_id: string;
          profile_id?: string | null;
          body: string;
          status?: CommentStatus;
          created_at?: string;
        };
        Update: {
          id?: string;
          entity_type?: string;
          entity_id?: string;
          profile_id?: string | null;
          body?: string;
          status?: CommentStatus;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'comments_profile_id_fkey';
            columns: ['profile_id'];
            referencedRelation: 'profiles';
            referencedSchema: 'public';
          }
        ];
      };
      newsletter_subscribers: {
        Row: {
          id: string;
          email: string;
          source: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          source?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          source?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      media_assets: {
        Row: {
          id: string;
          filename: string;
          original_name: string;
          url: string;
          mime_type: string;
          size_bytes: number;
          width: number | null;
          height: number | null;
          uploaded_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          filename: string;
          original_name: string;
          url: string;
          mime_type: string;
          size_bytes: number;
          width?: number | null;
          height?: number | null;
          uploaded_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          filename?: string;
          original_name?: string;
          url?: string;
          mime_type?: string;
          size_bytes?: number;
          width?: number | null;
          height?: number | null;
          uploaded_by?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'media_assets_uploaded_by_fkey';
            columns: ['uploaded_by'];
            referencedRelation: 'profiles';
            referencedSchema: 'public';
          }
        ];
      };
      audit_logs: {
        Row: {
          id: string;
          actor_id: string | null;
          actor_email: string | null;
          actor_role: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          metadata: Json | null;
          ip_hash: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          actor_email?: string | null;
          actor_role?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          metadata?: Json | null;
          ip_hash?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor_id?: string | null;
          actor_email?: string | null;
          actor_role?: string | null;
          action?: string;
          entity_type?: string;
          entity_id?: string | null;
          metadata?: Json | null;
          ip_hash?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'audit_logs_actor_id_fkey';
            columns: ['actor_id'];
            referencedRelation: 'profiles';
            referencedSchema: 'public';
          }
        ];
      };
      view_events: {
        Row: {
          id: string;
          article_id: string;
          path: string;
          referrer: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          article_id: string;
          path: string;
          referrer?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          article_id?: string;
          path?: string;
          referrer?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'view_events_article_id_fkey';
            columns: ['article_id'];
            referencedRelation: 'articles';
            referencedSchema: 'public';
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      content_status: ContentStatus;
      user_role: UserRole;
      plan_tier: PlanTier;
      comment_status: CommentStatus;
    };
  };
}
