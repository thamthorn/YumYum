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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      buyer_certifications: {
        Row: {
          buyer_org_id: string
          certification_id: string
          created_at: string
          importance: string
        }
        Insert: {
          buyer_org_id: string
          certification_id: string
          created_at?: string
          importance?: string
        }
        Update: {
          buyer_org_id?: string
          certification_id?: string
          created_at?: string
          importance?: string
        }
        Relationships: [
          {
            foreignKeyName: "buyer_certifications_buyer_org_id_fkey"
            columns: ["buyer_org_id"]
            isOneToOne: false
            referencedRelation: "buyer_dashboard_stats"
            referencedColumns: ["buyer_org_id"]
          },
          {
            foreignKeyName: "buyer_certifications_buyer_org_id_fkey"
            columns: ["buyer_org_id"]
            isOneToOne: false
            referencedRelation: "buyer_profiles"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "buyer_certifications_certification_id_fkey"
            columns: ["certification_id"]
            isOneToOne: false
            referencedRelation: "certifications"
            referencedColumns: ["id"]
          },
        ]
      }
      buyer_preferences: {
        Row: {
          created_at: string
          cross_border: boolean | null
          id: string
          location_preference: string | null
          metadata: Json | null
          moq_max: number | null
          moq_min: number | null
          organization_id: string
          product_type: string | null
          prototype_needed: boolean | null
          timeline: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          cross_border?: boolean | null
          id?: string
          location_preference?: string | null
          metadata?: Json | null
          moq_max?: number | null
          moq_min?: number | null
          organization_id: string
          product_type?: string | null
          prototype_needed?: boolean | null
          timeline?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          cross_border?: boolean | null
          id?: string
          location_preference?: string | null
          metadata?: Json | null
          moq_max?: number | null
          moq_min?: number | null
          organization_id?: string
          product_type?: string | null
          prototype_needed?: boolean | null
          timeline?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "buyer_preferences_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "buyer_dashboard_stats"
            referencedColumns: ["buyer_org_id"]
          },
          {
            foreignKeyName: "buyer_preferences_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "buyer_profiles"
            referencedColumns: ["organization_id"]
          },
        ]
      }
      buyer_profiles: {
        Row: {
          annual_volume_estimate: number | null
          company_name: string | null
          company_size: string | null
          created_at: string
          cross_border: boolean | null
          notes: string | null
          organization_id: string
          preferred_currency: string | null
          prototype_needed: boolean | null
          updated_at: string
        }
        Insert: {
          annual_volume_estimate?: number | null
          company_name?: string | null
          company_size?: string | null
          created_at?: string
          cross_border?: boolean | null
          notes?: string | null
          organization_id: string
          preferred_currency?: string | null
          prototype_needed?: boolean | null
          updated_at?: string
        }
        Update: {
          annual_volume_estimate?: number | null
          company_name?: string | null
          company_size?: string | null
          created_at?: string
          cross_border?: boolean | null
          notes?: string | null
          organization_id?: string
          preferred_currency?: string | null
          prototype_needed?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "buyer_profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      buyer_saved_oems: {
        Row: {
          buyer_org_id: string
          created_at: string
          oem_org_id: string
        }
        Insert: {
          buyer_org_id: string
          created_at?: string
          oem_org_id: string
        }
        Update: {
          buyer_org_id?: string
          created_at?: string
          oem_org_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "buyer_saved_oems_buyer_org_id_fkey"
            columns: ["buyer_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "buyer_saved_oems_oem_org_id_fkey"
            columns: ["oem_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      certifications: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      industries: {
        Row: {
          key: string
          label: string
        }
        Insert: {
          key: string
          label: string
        }
        Update: {
          key?: string
          label?: string
        }
        Relationships: []
      }
      matches: {
        Row: {
          buyer_org_id: string
          created_at: string
          digest: Json | null
          id: string
          last_viewed_at: string | null
          oem_org_id: string
          score: number | null
          source: string | null
          status: Database["public"]["Enums"]["match_status"]
          updated_at: string
        }
        Insert: {
          buyer_org_id: string
          created_at?: string
          digest?: Json | null
          id?: string
          last_viewed_at?: string | null
          oem_org_id: string
          score?: number | null
          source?: string | null
          status?: Database["public"]["Enums"]["match_status"]
          updated_at?: string
        }
        Update: {
          buyer_org_id?: string
          created_at?: string
          digest?: Json | null
          id?: string
          last_viewed_at?: string | null
          oem_org_id?: string
          score?: number | null
          source?: string | null
          status?: Database["public"]["Enums"]["match_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_buyer_org_id_fkey"
            columns: ["buyer_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_oem_org_id_fkey"
            columns: ["oem_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      oem_certifications: {
        Row: {
          certification_id: string
          created_at: string
          oem_org_id: string
          verification_tier: Database["public"]["Enums"]["verification_tier"]
          verified: boolean
          verified_at: string | null
          verifier_id: string | null
        }
        Insert: {
          certification_id: string
          created_at?: string
          oem_org_id: string
          verification_tier?: Database["public"]["Enums"]["verification_tier"]
          verified?: boolean
          verified_at?: string | null
          verifier_id?: string | null
        }
        Update: {
          certification_id?: string
          created_at?: string
          oem_org_id?: string
          verification_tier?: Database["public"]["Enums"]["verification_tier"]
          verified?: boolean
          verified_at?: string | null
          verifier_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "oem_certifications_certification_id_fkey"
            columns: ["certification_id"]
            isOneToOne: false
            referencedRelation: "certifications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oem_certifications_oem_org_id_fkey"
            columns: ["oem_org_id"]
            isOneToOne: false
            referencedRelation: "oem_dashboard_stats"
            referencedColumns: ["oem_org_id"]
          },
          {
            foreignKeyName: "oem_certifications_oem_org_id_fkey"
            columns: ["oem_org_id"]
            isOneToOne: false
            referencedRelation: "oem_profiles"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "oem_certifications_verifier_id_fkey"
            columns: ["verifier_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      oem_languages: {
        Row: {
          created_at: string
          language_code: string
          oem_org_id: string
          proficiency: string | null
        }
        Insert: {
          created_at?: string
          language_code: string
          oem_org_id: string
          proficiency?: string | null
        }
        Update: {
          created_at?: string
          language_code?: string
          oem_org_id?: string
          proficiency?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "oem_languages_oem_org_id_fkey"
            columns: ["oem_org_id"]
            isOneToOne: false
            referencedRelation: "oem_dashboard_stats"
            referencedColumns: ["oem_org_id"]
          },
          {
            foreignKeyName: "oem_languages_oem_org_id_fkey"
            columns: ["oem_org_id"]
            isOneToOne: false
            referencedRelation: "oem_profiles"
            referencedColumns: ["organization_id"]
          },
        ]
      }
      oem_previous_products: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          note: string | null
          oem_org_id: string
          tags: string[] | null
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          note?: string | null
          oem_org_id: string
          tags?: string[] | null
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          note?: string | null
          oem_org_id?: string
          tags?: string[] | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "oem_previous_products_oem_org_id_fkey"
            columns: ["oem_org_id"]
            isOneToOne: false
            referencedRelation: "oem_dashboard_stats"
            referencedColumns: ["oem_org_id"]
          },
          {
            foreignKeyName: "oem_previous_products_oem_org_id_fkey"
            columns: ["oem_org_id"]
            isOneToOne: false
            referencedRelation: "oem_profiles"
            referencedColumns: ["organization_id"]
          },
        ]
      }
      oem_profiles: {
        Row: {
          created_at: string
          cross_border: boolean | null
          lead_time_days: number | null
          moq_max: number | null
          moq_min: number | null
          organization_id: string
          prototype_support: boolean | null
          rating: number | null
          response_time_hours: number | null
          scale: Database["public"]["Enums"]["scale_type"] | null
          short_description: string | null
          total_reviews: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          cross_border?: boolean | null
          lead_time_days?: number | null
          moq_max?: number | null
          moq_min?: number | null
          organization_id: string
          prototype_support?: boolean | null
          rating?: number | null
          response_time_hours?: number | null
          scale?: Database["public"]["Enums"]["scale_type"] | null
          short_description?: string | null
          total_reviews?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          cross_border?: boolean | null
          lead_time_days?: number | null
          moq_max?: number | null
          moq_min?: number | null
          organization_id?: string
          prototype_support?: boolean | null
          rating?: number | null
          response_time_hours?: number | null
          scale?: Database["public"]["Enums"]["scale_type"] | null
          short_description?: string | null
          total_reviews?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "oem_profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      oem_services: {
        Row: {
          created_at: string
          oem_org_id: string
          service_id: string
        }
        Insert: {
          created_at?: string
          oem_org_id: string
          service_id: string
        }
        Update: {
          created_at?: string
          oem_org_id?: string
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "oem_services_oem_org_id_fkey"
            columns: ["oem_org_id"]
            isOneToOne: false
            referencedRelation: "oem_dashboard_stats"
            referencedColumns: ["oem_org_id"]
          },
          {
            foreignKeyName: "oem_services_oem_org_id_fkey"
            columns: ["oem_org_id"]
            isOneToOne: false
            referencedRelation: "oem_profiles"
            referencedColumns: ["organization_id"]
          },
          {
            foreignKeyName: "oem_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      order_documents: {
        Row: {
          bucket: string
          id: string
          order_id: string
          path: string
          title: string | null
          uploaded_at: string
          uploaded_by: string | null
        }
        Insert: {
          bucket: string
          id?: string
          order_id: string
          path: string
          title?: string | null
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Update: {
          bucket?: string
          id?: string
          order_id?: string
          path?: string
          title?: string | null
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_documents_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "active_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_documents_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      order_events: {
        Row: {
          created_at: string
          created_by: string | null
          event_type: Database["public"]["Enums"]["order_event_type"]
          id: string
          order_id: string
          payload: Json | null
          stage: Database["public"]["Enums"]["order_status"] | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          event_type: Database["public"]["Enums"]["order_event_type"]
          id?: string
          order_id: string
          payload?: Json | null
          stage?: Database["public"]["Enums"]["order_status"] | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          event_type?: Database["public"]["Enums"]["order_event_type"]
          id?: string
          order_id?: string
          payload?: Json | null
          stage?: Database["public"]["Enums"]["order_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "order_events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "active_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_line_items: {
        Row: {
          created_at: string
          currency: string | null
          description: string | null
          id: string
          order_id: string
          quantity: number | null
          sku: string | null
          unit: string | null
          unit_price: number | null
        }
        Insert: {
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          order_id: string
          quantity?: number | null
          sku?: string | null
          unit?: string | null
          unit_price?: number | null
        }
        Update: {
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          order_id?: string
          quantity?: number | null
          sku?: string | null
          unit?: string | null
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "order_line_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "active_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_line_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          actual_delivery_date: string | null
          buyer_org_id: string
          created_at: string
          created_by: string | null
          currency: string
          estimated_delivery_date: string | null
          id: string
          oem_org_id: string
          production_start_date: string | null
          quantity_total: number | null
          request_id: string | null
          shipping_provider: string | null
          status: Database["public"]["Enums"]["order_status"]
          total_value: number | null
          tracking_number: string | null
          unit: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          actual_delivery_date?: string | null
          buyer_org_id: string
          created_at?: string
          created_by?: string | null
          currency?: string
          estimated_delivery_date?: string | null
          id?: string
          oem_org_id: string
          production_start_date?: string | null
          quantity_total?: number | null
          request_id?: string | null
          shipping_provider?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          total_value?: number | null
          tracking_number?: string | null
          unit?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          actual_delivery_date?: string | null
          buyer_org_id?: string
          created_at?: string
          created_by?: string | null
          currency?: string
          estimated_delivery_date?: string | null
          id?: string
          oem_org_id?: string
          production_start_date?: string | null
          quantity_total?: number | null
          request_id?: string | null
          shipping_provider?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          total_value?: number | null
          tracking_number?: string | null
          unit?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_buyer_org_id_fkey"
            columns: ["buyer_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_oem_org_id_fkey"
            columns: ["oem_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          accepted_at: string | null
          created_at: string
          created_by: string | null
          invited_at: string | null
          organization_id: string
          profile_id: string
          role_in_org: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          created_by?: string | null
          invited_at?: string | null
          organization_id: string
          profile_id: string
          role_in_org?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          created_by?: string | null
          invited_at?: string | null
          organization_id?: string
          profile_id?: string
          role_in_org?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          country_code: string | null
          created_at: string
          description: string | null
          display_name: string
          established_year: number | null
          headcount_range: string | null
          id: string
          industry: string | null
          location: string | null
          logo_url: string | null
          owner_id: string | null
          slug: string | null
          type: Database["public"]["Enums"]["organization_type"]
          updated_at: string
          website: string | null
        }
        Insert: {
          country_code?: string | null
          created_at?: string
          description?: string | null
          display_name: string
          established_year?: number | null
          headcount_range?: string | null
          id?: string
          industry?: string | null
          location?: string | null
          logo_url?: string | null
          owner_id?: string | null
          slug?: string | null
          type: Database["public"]["Enums"]["organization_type"]
          updated_at?: string
          website?: string | null
        }
        Update: {
          country_code?: string | null
          created_at?: string
          description?: string | null
          display_name?: string
          established_year?: number | null
          headcount_range?: string | null
          id?: string
          industry?: string | null
          location?: string | null
          logo_url?: string | null
          owner_id?: string | null
          slug?: string | null
          type?: Database["public"]["Enums"]["organization_type"]
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organizations_industry_fkey"
            columns: ["industry"]
            isOneToOne: false
            referencedRelation: "industries"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "organizations_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          role: Database["public"]["Enums"]["account_role"]
          timezone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["account_role"]
          timezone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["account_role"]
          timezone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      request_files: {
        Row: {
          bucket: string
          id: string
          mime_type: string | null
          path: string
          request_id: string
          size_bytes: number | null
          uploaded_at: string
          uploaded_by: string | null
        }
        Insert: {
          bucket: string
          id?: string
          mime_type?: string | null
          path: string
          request_id: string
          size_bytes?: number | null
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Update: {
          bucket?: string
          id?: string
          mime_type?: string | null
          path?: string
          request_id?: string
          size_bytes?: number | null
          uploaded_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "request_files_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "request_files_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      request_updates: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          note: string | null
          request_id: string
          status: Database["public"]["Enums"]["request_status"] | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          note?: string | null
          request_id: string
          status?: Database["public"]["Enums"]["request_status"] | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          note?: string | null
          request_id?: string
          status?: Database["public"]["Enums"]["request_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "request_updates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "request_updates_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
        ]
      }
      requests: {
        Row: {
          add_audit: boolean | null
          add_escrow: boolean | null
          buyer_org_id: string
          created_at: string
          created_by: string | null
          id: string
          oem_org_id: string
          payment_terms: string | null
          product_brief: string | null
          quantity_max: number | null
          quantity_min: number | null
          resolved_at: string | null
          shipping_terms: string | null
          status: Database["public"]["Enums"]["request_status"]
          submitted_at: string | null
          timeline: string | null
          title: string | null
          type: Database["public"]["Enums"]["request_type"]
          unit: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          add_audit?: boolean | null
          add_escrow?: boolean | null
          buyer_org_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          oem_org_id: string
          payment_terms?: string | null
          product_brief?: string | null
          quantity_max?: number | null
          quantity_min?: number | null
          resolved_at?: string | null
          shipping_terms?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          submitted_at?: string | null
          timeline?: string | null
          title?: string | null
          type?: Database["public"]["Enums"]["request_type"]
          unit?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          add_audit?: boolean | null
          add_escrow?: boolean | null
          buyer_org_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          oem_org_id?: string
          payment_terms?: string | null
          product_brief?: string | null
          quantity_max?: number | null
          quantity_min?: number | null
          resolved_at?: string | null
          shipping_terms?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          submitted_at?: string | null
          timeline?: string | null
          title?: string | null
          type?: Database["public"]["Enums"]["request_type"]
          unit?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "requests_buyer_org_id_fkey"
            columns: ["buyer_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requests_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requests_oem_org_id_fkey"
            columns: ["oem_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requests_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      active_orders: {
        Row: {
          actual_delivery_date: string | null
          buyer_org_id: string | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          current_stage: Database["public"]["Enums"]["order_status"] | null
          estimated_delivery_date: string | null
          id: string | null
          oem_org_id: string | null
          production_start_date: string | null
          quantity_total: number | null
          request_id: string | null
          shipping_provider: string | null
          stage_updated_at: string | null
          status: Database["public"]["Enums"]["order_status"] | null
          total_value: number | null
          tracking_number: string | null
          unit: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_buyer_org_id_fkey"
            columns: ["buyer_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_oem_org_id_fkey"
            columns: ["oem_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      buyer_dashboard_stats: {
        Row: {
          buyer_org_id: string | null
          match_count: number | null
          order_count: number | null
          request_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "buyer_profiles_organization_id_fkey"
            columns: ["buyer_org_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      oem_dashboard_stats: {
        Row: {
          active_orders: number | null
          average_order_value: number | null
          oem_org_id: string | null
          request_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "oem_profiles_organization_id_fkey"
            columns: ["oem_org_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
      is_org_member: { Args: { org_id: string }; Returns: boolean }
      is_org_type_member: {
        Args: {
          expected: Database["public"]["Enums"]["organization_type"]
          org_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      account_role: "buyer" | "oem" | "admin"
      match_status:
        | "new_match"
        | "contacted"
        | "in_discussion"
        | "quote_requested"
        | "declined"
        | "archived"
      order_event_type:
        | "status_change"
        | "note"
        | "file_upload"
        | "payment"
        | "logistics"
      order_status:
        | "signed"
        | "preparation"
        | "manufacturing"
        | "delivering"
        | "completed"
        | "cancelled"
      organization_type: "buyer" | "oem"
      request_status:
        | "draft"
        | "submitted"
        | "pending_oem"
        | "quote_received"
        | "in_review"
        | "accepted"
        | "in_production"
        | "completed"
        | "cancelled"
      request_type: "quote" | "prototype"
      scale_type: "small" | "medium" | "large"
      verification_tier: "none" | "verified" | "certified" | "trusted_partner"
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
      account_role: ["buyer", "oem", "admin"],
      match_status: [
        "new_match",
        "contacted",
        "in_discussion",
        "quote_requested",
        "declined",
        "archived",
      ],
      order_event_type: [
        "status_change",
        "note",
        "file_upload",
        "payment",
        "logistics",
      ],
      order_status: [
        "signed",
        "preparation",
        "manufacturing",
        "delivering",
        "completed",
        "cancelled",
      ],
      organization_type: ["buyer", "oem"],
      request_status: [
        "draft",
        "submitted",
        "pending_oem",
        "quote_received",
        "in_review",
        "accepted",
        "in_production",
        "completed",
        "cancelled",
      ],
      request_type: ["quote", "prototype"],
      scale_type: ["small", "medium", "large"],
      verification_tier: ["none", "verified", "certified", "trusted_partner"],
    },
  },
} as const

export type VerificationTier = Database["public"]["Enums"]["verification_tier"];
export type ScaleType = Database["public"]["Enums"]["scale_type"];
export type RequestStatus = Database["public"]["Enums"]["request_status"];
export type RequestType = Database["public"]["Enums"]["request_type"];
export type AccountRole = Database["public"]["Enums"]["account_role"];
export type OrganizationType = Database["public"]["Enums"]["organization_type"];
