export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      business_reviews: {
        Row: {
          author_image: string | null
          author_name: string
          business_id: string
          created_at: string
          fetched_at: string
          id: string
          likes: number | null
          rating: number
          review_text: string | null
          review_time: string | null
        }
        Insert: {
          author_image?: string | null
          author_name: string
          business_id: string
          created_at?: string
          fetched_at?: string
          id?: string
          likes?: number | null
          rating: number
          review_text?: string | null
          review_time?: string | null
        }
        Update: {
          author_image?: string | null
          author_name?: string
          business_id?: string
          created_at?: string
          fetched_at?: string
          id?: string
          likes?: number | null
          rating?: number
          review_text?: string | null
          review_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_reviews_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_service_coverage: {
        Row: {
          business_id: string
          city_id: string
          created_at: string | null
          id: string
          is_primary: boolean | null
          service_id: string
        }
        Insert: {
          business_id: string
          city_id: string
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          service_id: string
        }
        Update: {
          business_id?: string
          city_id?: string
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_service_coverage_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_service_coverage_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_service_coverage_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          address: string | null
          categories: string[] | null
          city_id: string | null
          created_at: string | null
          description: string | null
          email: string | null
          email_verified: boolean | null
          emails: string[] | null
          employee_count: string | null
          facebook: string | null
          founded_year: number | null
          gbp_id: string | null
          id: string
          images: string[] | null
          industry: string | null
          instagram: string | null
          is_active: boolean | null
          lat: number | null
          linkedin: string | null
          lng: number | null
          name: string
          opening_hours: Json | null
          phone: string | null
          price_level: number | null
          rating: number | null
          review_count: number | null
          slug: string
          twitter: string | null
          updated_at: string | null
          verified: boolean | null
          website: string | null
          youtube: string | null
        }
        Insert: {
          address?: string | null
          categories?: string[] | null
          city_id?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          email_verified?: boolean | null
          emails?: string[] | null
          employee_count?: string | null
          facebook?: string | null
          founded_year?: number | null
          gbp_id?: string | null
          id?: string
          images?: string[] | null
          industry?: string | null
          instagram?: string | null
          is_active?: boolean | null
          lat?: number | null
          linkedin?: string | null
          lng?: number | null
          name: string
          opening_hours?: Json | null
          phone?: string | null
          price_level?: number | null
          rating?: number | null
          review_count?: number | null
          slug: string
          twitter?: string | null
          updated_at?: string | null
          verified?: boolean | null
          website?: string | null
          youtube?: string | null
        }
        Update: {
          address?: string | null
          categories?: string[] | null
          city_id?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          email_verified?: boolean | null
          emails?: string[] | null
          employee_count?: string | null
          facebook?: string | null
          founded_year?: number | null
          gbp_id?: string | null
          id?: string
          images?: string[] | null
          industry?: string | null
          instagram?: string | null
          is_active?: boolean | null
          lat?: number | null
          linkedin?: string | null
          lng?: number | null
          name?: string
          opening_hours?: Json | null
          phone?: string | null
          price_level?: number | null
          rating?: number | null
          review_count?: number | null
          slug?: string
          twitter?: string | null
          updated_at?: string | null
          verified?: boolean | null
          website?: string | null
          youtube?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "businesses_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      cities: {
        Row: {
          created_at: string | null
          id: string
          lat: number | null
          lead_notification_email: string | null
          lng: number | null
          name: string
          population: number | null
          region: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          lat?: number | null
          lead_notification_email?: string | null
          lng?: number | null
          name: string
          population?: number | null
          region?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          lat?: number | null
          lead_notification_email?: string | null
          lng?: number | null
          name?: string
          population?: number | null
          region?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string | null
          email: string
          id: string
          message: string
          name: string
          subject: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
          subject?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          subject?: string | null
        }
        Relationships: []
      }
      featured_slots: {
        Row: {
          business_id: string | null
          city_id: string
          created_at: string | null
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          end_date: string | null
          id: string
          is_placeholder: boolean | null
          notes: string | null
          plan: string | null
          price_monthly: number | null
          service_id: string
          start_date: string | null
          status: Database["public"]["Enums"]["featured_status"]
          updated_at: string | null
        }
        Insert: {
          business_id?: string | null
          city_id: string
          created_at?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          end_date?: string | null
          id?: string
          is_placeholder?: boolean | null
          notes?: string | null
          plan?: string | null
          price_monthly?: number | null
          service_id: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["featured_status"]
          updated_at?: string | null
        }
        Update: {
          business_id?: string | null
          city_id?: string
          created_at?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          end_date?: string | null
          id?: string
          is_placeholder?: boolean | null
          notes?: string | null
          plan?: string | null
          price_monthly?: number | null
          service_id?: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["featured_status"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "featured_slots_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "featured_slots_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "featured_slots_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          business_id: string | null
          city_id: string | null
          created_at: string | null
          email: string
          from_area: string | null
          housing_type: string | null
          id: string
          message: string | null
          move_date: string | null
          name: string
          phone: string | null
          service_id: string | null
          source_url: string | null
          status: string | null
          to_area: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          business_id?: string | null
          city_id?: string | null
          created_at?: string | null
          email: string
          from_area?: string | null
          housing_type?: string | null
          id?: string
          message?: string | null
          move_date?: string | null
          name: string
          phone?: string | null
          service_id?: string | null
          source_url?: string | null
          status?: string | null
          to_area?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          business_id?: string | null
          city_id?: string | null
          created_at?: string | null
          email?: string
          from_area?: string | null
          housing_type?: string | null
          id?: string
          message?: string | null
          move_date?: string | null
          name?: string
          phone?: string | null
          service_id?: string | null
          source_url?: string | null
          status?: string | null
          to_area?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      pages: {
        Row: {
          content: string | null
          created_at: string | null
          faq: Json | null
          h1: string | null
          id: string
          meta_description: string | null
          noindex: boolean | null
          og_image: string | null
          route: string
          title: string | null
          updated_at: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          faq?: Json | null
          h1?: string | null
          id?: string
          meta_description?: string | null
          noindex?: boolean | null
          og_image?: string | null
          route: string
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          faq?: Json | null
          h1?: string | null
          id?: string
          meta_description?: string | null
          noindex?: boolean | null
          og_image?: string | null
          route?: string
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      scrape_jobs: {
        Row: {
          cities: string[]
          city_limit: number
          created_at: string
          error_message: string | null
          id: string
          request_id: string
          results: Json | null
          search_term: string
          service_id: string | null
          status: string
          summary: Json | null
          updated_at: string
        }
        Insert: {
          cities?: string[]
          city_limit?: number
          created_at?: string
          error_message?: string | null
          id?: string
          request_id: string
          results?: Json | null
          search_term: string
          service_id?: string | null
          status?: string
          summary?: Json | null
          updated_at?: string
        }
        Update: {
          cities?: string[]
          city_limit?: number
          created_at?: string
          error_message?: string | null
          id?: string
          request_id?: string
          results?: Json | null
          search_term?: string
          service_id?: string | null
          status?: string
          summary?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scrape_jobs_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_content: {
        Row: {
          checklist: Json | null
          city_id: string | null
          created_at: string
          faqs: Json | null
          feature_cards: Json | null
          generated_at: string | null
          id: string
          intro_text: string | null
          service_id: string | null
          tips: Json | null
          updated_at: string
        }
        Insert: {
          checklist?: Json | null
          city_id?: string | null
          created_at?: string
          faqs?: Json | null
          feature_cards?: Json | null
          generated_at?: string | null
          id?: string
          intro_text?: string | null
          service_id?: string | null
          tips?: Json | null
          updated_at?: string
        }
        Update: {
          checklist?: Json | null
          city_id?: string | null
          created_at?: string
          faqs?: Json | null
          feature_cards?: Json | null
          generated_at?: string | null
          id?: string
          intro_text?: string | null
          service_id?: string | null
          tips?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_content_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_content_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          category: Database["public"]["Enums"]["service_category"]
          checklist_template: Json | null
          created_at: string | null
          description: string | null
          faqs_template: Json | null
          feature_cards_template: Json | null
          icon: string | null
          id: string
          intro_template: string | null
          name: string
          parent_service_id: string | null
          seo_description_template: string | null
          seo_title_template: string | null
          slug: string
          tips_template: Json | null
          updated_at: string | null
        }
        Insert: {
          category?: Database["public"]["Enums"]["service_category"]
          checklist_template?: Json | null
          created_at?: string | null
          description?: string | null
          faqs_template?: Json | null
          feature_cards_template?: Json | null
          icon?: string | null
          id?: string
          intro_template?: string | null
          name: string
          parent_service_id?: string | null
          seo_description_template?: string | null
          seo_title_template?: string | null
          slug: string
          tips_template?: Json | null
          updated_at?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["service_category"]
          checklist_template?: Json | null
          created_at?: string | null
          description?: string | null
          faqs_template?: Json | null
          feature_cards_template?: Json | null
          icon?: string | null
          id?: string
          intro_template?: string | null
          name?: string
          parent_service_id?: string | null
          seo_description_template?: string | null
          seo_title_template?: string | null
          slug?: string
          tips_template?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "services_parent_service_id_fkey"
            columns: ["parent_service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          created_at: string | null
          id: string
          key: string
          updated_at: string | null
          value: Json | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value?: Json | null
        }
        Update: {
          created_at?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: Json | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      featured_slots_public: {
        Row: {
          business_id: string | null
          city_id: string | null
          created_at: string | null
          id: string | null
          is_placeholder: boolean | null
          service_id: string | null
          status: Database["public"]["Enums"]["featured_status"] | null
          updated_at: string | null
        }
        Insert: {
          business_id?: string | null
          city_id?: string | null
          created_at?: string | null
          id?: string | null
          is_placeholder?: boolean | null
          service_id?: string | null
          status?: Database["public"]["Enums"]["featured_status"] | null
          updated_at?: string | null
        }
        Update: {
          business_id?: string | null
          city_id?: string | null
          created_at?: string | null
          id?: string | null
          is_placeholder?: boolean | null
          service_id?: string | null
          status?: Database["public"]["Enums"]["featured_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "featured_slots_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "featured_slots_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "featured_slots_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      featured_status: "active" | "pending" | "expired"
      service_category: "moving" | "cleaning" | "dental" | "other"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      featured_status: ["active", "pending", "expired"],
      service_category: ["moving", "cleaning", "dental", "other"],
    },
  },
} as const
