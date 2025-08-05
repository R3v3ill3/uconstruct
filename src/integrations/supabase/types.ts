export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      employers: {
        Row: {
          abn: string | null
          created_at: string | null
          employer_type: Database["public"]["Enums"]["employer_type"]
          enterprise_agreement_status: boolean | null
          id: string
          name: string
          parent_employer_id: string | null
          updated_at: string | null
        }
        Insert: {
          abn?: string | null
          created_at?: string | null
          employer_type: Database["public"]["Enums"]["employer_type"]
          enterprise_agreement_status?: boolean | null
          id?: string
          name: string
          parent_employer_id?: string | null
          updated_at?: string | null
        }
        Update: {
          abn?: string | null
          created_at?: string | null
          employer_type?: Database["public"]["Enums"]["employer_type"]
          enterprise_agreement_status?: boolean | null
          id?: string
          name?: string
          parent_employer_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employers_parent_employer_id_fkey"
            columns: ["parent_employer_id"]
            isOneToOne: false
            referencedRelation: "employers"
            referencedColumns: ["id"]
          },
        ]
      }
      job_sites: {
        Row: {
          created_at: string | null
          full_address: string | null
          id: string
          is_main_site: boolean | null
          location: string
          main_builder_id: string | null
          name: string
          project_id: string | null
          project_type: string | null
          shifts: Database["public"]["Enums"]["shift_type"][] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          full_address?: string | null
          id?: string
          is_main_site?: boolean | null
          location: string
          main_builder_id?: string | null
          name: string
          project_id?: string | null
          project_type?: string | null
          shifts?: Database["public"]["Enums"]["shift_type"][] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          full_address?: string | null
          id?: string
          is_main_site?: boolean | null
          location?: string
          main_builder_id?: string | null
          name?: string
          project_id?: string | null
          project_type?: string | null
          shifts?: Database["public"]["Enums"]["shift_type"][] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_job_sites_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_sites_main_builder_id_fkey"
            columns: ["main_builder_id"]
            isOneToOne: false
            referencedRelation: "employers"
            referencedColumns: ["id"]
          },
        ]
      }
      organisers: {
        Row: {
          created_at: string
          email: string | null
          first_name: string
          id: string
          last_name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          first_name: string
          id?: string
          last_name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          role: string | null
          scoped_employers: string[] | null
          scoped_sites: string[] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          role?: string | null
          scoped_employers?: string[] | null
          scoped_sites?: string[] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          scoped_employers?: string[] | null
          scoped_sites?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      project_eba_details: {
        Row: {
          bargaining_status: string | null
          created_at: string
          eba_title: string | null
          id: string
          project_id: string
          registration_number: string | null
          status: Database["public"]["Enums"]["eba_status"]
          updated_at: string
        }
        Insert: {
          bargaining_status?: string | null
          created_at?: string
          eba_title?: string | null
          id?: string
          project_id: string
          registration_number?: string | null
          status?: Database["public"]["Enums"]["eba_status"]
          updated_at?: string
        }
        Update: {
          bargaining_status?: string | null
          created_at?: string
          eba_title?: string | null
          id?: string
          project_id?: string
          registration_number?: string | null
          status?: Database["public"]["Enums"]["eba_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_project_eba_details_project"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_organisers: {
        Row: {
          created_at: string
          id: string
          organiser_id: string
          project_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          organiser_id: string
          project_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          organiser_id?: string
          project_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_project_organisers_organiser"
            columns: ["organiser_id"]
            isOneToOne: false
            referencedRelation: "organisers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_project_organisers_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          builder_id: string | null
          created_at: string
          id: string
          main_job_site_id: string | null
          name: string
          proposed_finish_date: string | null
          proposed_start_date: string | null
          roe_email: string | null
          updated_at: string
          value: number | null
        }
        Insert: {
          builder_id?: string | null
          created_at?: string
          id?: string
          main_job_site_id?: string | null
          name: string
          proposed_finish_date?: string | null
          proposed_start_date?: string | null
          roe_email?: string | null
          updated_at?: string
          value?: number | null
        }
        Update: {
          builder_id?: string | null
          created_at?: string
          id?: string
          main_job_site_id?: string | null
          name?: string
          proposed_finish_date?: string | null
          proposed_start_date?: string | null
          roe_email?: string | null
          updated_at?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_projects_builder"
            columns: ["builder_id"]
            isOneToOne: false
            referencedRelation: "employers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_projects_main_job_site"
            columns: ["main_job_site_id"]
            isOneToOne: false
            referencedRelation: "job_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      site_contacts: {
        Row: {
          created_at: string
          email: string | null
          id: string
          job_site_id: string
          name: string
          phone: string | null
          role: Database["public"]["Enums"]["site_contact_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          job_site_id: string
          name: string
          phone?: string | null
          role: Database["public"]["Enums"]["site_contact_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          job_site_id?: string
          name?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["site_contact_role"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_site_contacts_job_site"
            columns: ["job_site_id"]
            isOneToOne: false
            referencedRelation: "job_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      site_contractor_trades: {
        Row: {
          created_at: string
          eba_status: boolean | null
          employer_id: string | null
          end_date: string | null
          id: string
          job_site_id: string | null
          notes: string | null
          start_date: string | null
          trade_type: Database["public"]["Enums"]["trade_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          eba_status?: boolean | null
          employer_id?: string | null
          end_date?: string | null
          id?: string
          job_site_id?: string | null
          notes?: string | null
          start_date?: string | null
          trade_type: Database["public"]["Enums"]["trade_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          eba_status?: boolean | null
          employer_id?: string | null
          end_date?: string | null
          id?: string
          job_site_id?: string | null
          notes?: string | null
          start_date?: string | null
          trade_type?: Database["public"]["Enums"]["trade_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_contractor_trades_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "employers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_contractor_trades_job_site_id_fkey"
            columns: ["job_site_id"]
            isOneToOne: false
            referencedRelation: "job_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      site_employers: {
        Row: {
          created_at: string | null
          employer_id: string | null
          id: string
          job_site_id: string | null
        }
        Insert: {
          created_at?: string | null
          employer_id?: string | null
          id?: string
          job_site_id?: string | null
        }
        Update: {
          created_at?: string | null
          employer_id?: string | null
          id?: string
          job_site_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "site_employers_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "employers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_employers_job_site_id_fkey"
            columns: ["job_site_id"]
            isOneToOne: false
            referencedRelation: "job_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      training_participation: {
        Row: {
          created_at: string | null
          date: string
          id: string
          location: string | null
          status: Database["public"]["Enums"]["training_status"] | null
          training_type: string
          updated_at: string | null
          worker_id: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          location?: string | null
          status?: Database["public"]["Enums"]["training_status"] | null
          training_type: string
          updated_at?: string | null
          worker_id?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          location?: string | null
          status?: Database["public"]["Enums"]["training_status"] | null
          training_type?: string
          updated_at?: string | null
          worker_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "training_participation_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      union_activities: {
        Row: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          created_at: string | null
          date: string
          id: string
          job_site_id: string | null
          notes: string | null
          topic: string | null
          updated_at: string | null
        }
        Insert: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          created_at?: string | null
          date: string
          id?: string
          job_site_id?: string | null
          notes?: string | null
          topic?: string | null
          updated_at?: string | null
        }
        Update: {
          activity_type?: Database["public"]["Enums"]["activity_type"]
          created_at?: string | null
          date?: string
          id?: string
          job_site_id?: string | null
          notes?: string | null
          topic?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "union_activities_job_site_id_fkey"
            columns: ["job_site_id"]
            isOneToOne: false
            referencedRelation: "job_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      union_roles: {
        Row: {
          created_at: string | null
          end_date: string | null
          experience_level: string | null
          gets_paid_time: boolean | null
          id: string
          is_senior: boolean | null
          job_site_id: string | null
          name: Database["public"]["Enums"]["union_role_type"]
          notes: string | null
          rating: string | null
          start_date: string
          updated_at: string | null
          worker_id: string | null
        }
        Insert: {
          created_at?: string | null
          end_date?: string | null
          experience_level?: string | null
          gets_paid_time?: boolean | null
          id?: string
          is_senior?: boolean | null
          job_site_id?: string | null
          name: Database["public"]["Enums"]["union_role_type"]
          notes?: string | null
          rating?: string | null
          start_date: string
          updated_at?: string | null
          worker_id?: string | null
        }
        Update: {
          created_at?: string | null
          end_date?: string | null
          experience_level?: string | null
          gets_paid_time?: boolean | null
          id?: string
          is_senior?: boolean | null
          job_site_id?: string | null
          name?: Database["public"]["Enums"]["union_role_type"]
          notes?: string | null
          rating?: string | null
          start_date?: string
          updated_at?: string | null
          worker_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "union_roles_job_site_id_fkey"
            columns: ["job_site_id"]
            isOneToOne: false
            referencedRelation: "job_sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "union_roles_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      worker_activity_ratings: {
        Row: {
          activity_id: string | null
          created_at: string | null
          id: string
          notes: string | null
          rated_by: string | null
          rating_type: Database["public"]["Enums"]["rating_type"]
          rating_value: number | null
          worker_id: string | null
        }
        Insert: {
          activity_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          rated_by?: string | null
          rating_type: Database["public"]["Enums"]["rating_type"]
          rating_value?: number | null
          worker_id?: string | null
        }
        Update: {
          activity_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          rated_by?: string | null
          rating_type?: Database["public"]["Enums"]["rating_type"]
          rating_value?: number | null
          worker_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "worker_activity_ratings_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "union_activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "worker_activity_ratings_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      worker_placements: {
        Row: {
          created_at: string | null
          employer_id: string | null
          employment_status: Database["public"]["Enums"]["employment_status"]
          end_date: string | null
          id: string
          job_site_id: string | null
          job_title: string | null
          shift: Database["public"]["Enums"]["shift_type"] | null
          start_date: string
          updated_at: string | null
          worker_id: string | null
        }
        Insert: {
          created_at?: string | null
          employer_id?: string | null
          employment_status: Database["public"]["Enums"]["employment_status"]
          end_date?: string | null
          id?: string
          job_site_id?: string | null
          job_title?: string | null
          shift?: Database["public"]["Enums"]["shift_type"] | null
          start_date: string
          updated_at?: string | null
          worker_id?: string | null
        }
        Update: {
          created_at?: string | null
          employer_id?: string | null
          employment_status?: Database["public"]["Enums"]["employment_status"]
          end_date?: string | null
          id?: string
          job_site_id?: string | null
          job_title?: string | null
          shift?: Database["public"]["Enums"]["shift_type"] | null
          start_date?: string
          updated_at?: string | null
          worker_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "worker_placements_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "employers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "worker_placements_job_site_id_fkey"
            columns: ["job_site_id"]
            isOneToOne: false
            referencedRelation: "job_sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "worker_placements_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      workers: {
        Row: {
          created_at: string | null
          date_of_birth: string | null
          email: string | null
          first_name: string
          gender: string | null
          home_address_line_1: string | null
          home_address_line_2: string | null
          home_address_postcode: string | null
          home_address_state: string | null
          home_address_suburb: string | null
          home_phone: string | null
          id: string
          inductions: string[] | null
          informal_network_tags: string[] | null
          mobile_phone: string | null
          nickname: string | null
          other_industry_bodies: string[] | null
          other_name: string | null
          qualifications: string[] | null
          redundancy_fund: string | null
          superannuation_fund: string | null
          surname: string
          union_membership_status:
            | Database["public"]["Enums"]["union_membership_status"]
            | null
          updated_at: string | null
          work_phone: string | null
        }
        Insert: {
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          first_name: string
          gender?: string | null
          home_address_line_1?: string | null
          home_address_line_2?: string | null
          home_address_postcode?: string | null
          home_address_state?: string | null
          home_address_suburb?: string | null
          home_phone?: string | null
          id?: string
          inductions?: string[] | null
          informal_network_tags?: string[] | null
          mobile_phone?: string | null
          nickname?: string | null
          other_industry_bodies?: string[] | null
          other_name?: string | null
          qualifications?: string[] | null
          redundancy_fund?: string | null
          superannuation_fund?: string | null
          surname: string
          union_membership_status?:
            | Database["public"]["Enums"]["union_membership_status"]
            | null
          updated_at?: string | null
          work_phone?: string | null
        }
        Update: {
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          first_name?: string
          gender?: string | null
          home_address_line_1?: string | null
          home_address_line_2?: string | null
          home_address_postcode?: string | null
          home_address_state?: string | null
          home_address_suburb?: string | null
          home_phone?: string | null
          id?: string
          inductions?: string[] | null
          informal_network_tags?: string[] | null
          mobile_phone?: string | null
          nickname?: string | null
          other_industry_bodies?: string[] | null
          other_name?: string | null
          qualifications?: string[] | null
          redundancy_fund?: string | null
          superannuation_fund?: string | null
          surname?: string
          union_membership_status?:
            | Database["public"]["Enums"]["union_membership_status"]
            | null
          updated_at?: string | null
          work_phone?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { user_id: string }
        Returns: string
      }
      has_site_access: {
        Args: { user_id: string; site_id: string }
        Returns: boolean
      }
    }
    Enums: {
      activity_type:
        | "strike"
        | "training"
        | "conversation"
        | "action"
        | "meeting"
      eba_status: "yes" | "no" | "pending"
      employer_type:
        | "individual"
        | "small_contractor"
        | "large_contractor"
        | "principal_contractor"
      employment_status:
        | "permanent"
        | "casual"
        | "subcontractor"
        | "apprentice"
        | "trainee"
      rating_type: "support_level" | "leadership" | "risk"
      shift_type: "day" | "night" | "split" | "weekend"
      site_contact_role: "project_manager" | "site_manager"
      trade_type:
        | "scaffolding"
        | "form_work"
        | "reinforcing_steel"
        | "concrete"
        | "crane_and_rigging"
        | "plant_and_equipment"
        | "electrical"
        | "plumbing"
        | "carpentry"
        | "painting"
        | "flooring"
        | "roofing"
        | "glazing"
        | "landscaping"
        | "demolition"
        | "earthworks"
        | "structural_steel"
        | "mechanical_services"
        | "fire_protection"
        | "security_systems"
        | "cleaning"
        | "traffic_management"
        | "waste_management"
        | "general_construction"
        | "other"
      training_status: "completed" | "in_progress" | "cancelled" | "no_show"
      union_membership_status:
        | "member"
        | "non_member"
        | "potential"
        | "declined"
      union_role_type:
        | "member"
        | "hsr"
        | "site_delegate"
        | "shift_delegate"
        | "company_delegate"
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
      activity_type: [
        "strike",
        "training",
        "conversation",
        "action",
        "meeting",
      ],
      eba_status: ["yes", "no", "pending"],
      employer_type: [
        "individual",
        "small_contractor",
        "large_contractor",
        "principal_contractor",
      ],
      employment_status: [
        "permanent",
        "casual",
        "subcontractor",
        "apprentice",
        "trainee",
      ],
      rating_type: ["support_level", "leadership", "risk"],
      shift_type: ["day", "night", "split", "weekend"],
      site_contact_role: ["project_manager", "site_manager"],
      trade_type: [
        "scaffolding",
        "form_work",
        "reinforcing_steel",
        "concrete",
        "crane_and_rigging",
        "plant_and_equipment",
        "electrical",
        "plumbing",
        "carpentry",
        "painting",
        "flooring",
        "roofing",
        "glazing",
        "landscaping",
        "demolition",
        "earthworks",
        "structural_steel",
        "mechanical_services",
        "fire_protection",
        "security_systems",
        "cleaning",
        "traffic_management",
        "waste_management",
        "general_construction",
        "other",
      ],
      training_status: ["completed", "in_progress", "cancelled", "no_show"],
      union_membership_status: [
        "member",
        "non_member",
        "potential",
        "declined",
      ],
      union_role_type: [
        "member",
        "hsr",
        "site_delegate",
        "shift_delegate",
        "company_delegate",
      ],
    },
  },
} as const
