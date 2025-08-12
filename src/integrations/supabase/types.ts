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
      activity_delegations: {
        Row: {
          activity_id: string
          assigned_worker_id: string
          assignment_type: string | null
          created_at: string
          delegate_worker_id: string
          id: string
          source_activity_id: string | null
          updated_at: string
        }
        Insert: {
          activity_id: string
          assigned_worker_id: string
          assignment_type?: string | null
          created_at?: string
          delegate_worker_id: string
          id?: string
          source_activity_id?: string | null
          updated_at?: string
        }
        Update: {
          activity_id?: string
          assigned_worker_id?: string
          assignment_type?: string | null
          created_at?: string
          delegate_worker_id?: string
          id?: string
          source_activity_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      activity_participants: {
        Row: {
          activity_id: string
          assignment_method: string
          assignment_source_id: string | null
          created_at: string
          id: string
          notes: string | null
          participation_status: string | null
          updated_at: string
          worker_id: string
        }
        Insert: {
          activity_id: string
          assignment_method: string
          assignment_source_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          participation_status?: string | null
          updated_at?: string
          worker_id: string
        }
        Update: {
          activity_id?: string
          assignment_method?: string
          assignment_source_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          participation_status?: string | null
          updated_at?: string
          worker_id?: string
        }
        Relationships: []
      }
      activity_templates: {
        Row: {
          category: string
          created_at: string
          default_rating_criteria: Json | null
          description: string | null
          id: string
          is_predefined: boolean
          name: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          default_rating_criteria?: Json | null
          description?: string | null
          id?: string
          is_predefined?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          default_rating_criteria?: Json | null
          description?: string | null
          id?: string
          is_predefined?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      company_eba_records: {
        Row: {
          approved_date: string | null
          comments: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          date_barg_docs_sent: string | null
          date_draft_signing_sent: string | null
          date_eba_signed: string | null
          date_vote_occurred: string | null
          docs_prepared: string | null
          eba_data_form_received: string | null
          eba_file_number: string | null
          eba_lodged_fwc: string | null
          employer_id: string | null
          followup_email_sent: string | null
          followup_phone_call: string | null
          fwc_certified_date: string | null
          fwc_document_url: string | null
          fwc_lodgement_number: string | null
          fwc_matter_number: string | null
          id: string
          nominal_expiry_date: string | null
          out_of_office_received: string | null
          sector: string | null
          updated_at: string
        }
        Insert: {
          approved_date?: string | null
          comments?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          date_barg_docs_sent?: string | null
          date_draft_signing_sent?: string | null
          date_eba_signed?: string | null
          date_vote_occurred?: string | null
          docs_prepared?: string | null
          eba_data_form_received?: string | null
          eba_file_number?: string | null
          eba_lodged_fwc?: string | null
          employer_id?: string | null
          followup_email_sent?: string | null
          followup_phone_call?: string | null
          fwc_certified_date?: string | null
          fwc_document_url?: string | null
          fwc_lodgement_number?: string | null
          fwc_matter_number?: string | null
          id?: string
          nominal_expiry_date?: string | null
          out_of_office_received?: string | null
          sector?: string | null
          updated_at?: string
        }
        Update: {
          approved_date?: string | null
          comments?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          date_barg_docs_sent?: string | null
          date_draft_signing_sent?: string | null
          date_eba_signed?: string | null
          date_vote_occurred?: string | null
          docs_prepared?: string | null
          eba_data_form_received?: string | null
          eba_file_number?: string | null
          eba_lodged_fwc?: string | null
          employer_id?: string | null
          followup_email_sent?: string | null
          followup_phone_call?: string | null
          fwc_certified_date?: string | null
          fwc_document_url?: string | null
          fwc_lodgement_number?: string | null
          fwc_matter_number?: string | null
          id?: string
          nominal_expiry_date?: string | null
          out_of_office_received?: string | null
          sector?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_eba_records_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "employer_analytics"
            referencedColumns: ["employer_id"]
          },
          {
            foreignKeyName: "company_eba_records_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "employers"
            referencedColumns: ["id"]
          },
        ]
      }
      contractor_trade_capabilities: {
        Row: {
          created_at: string | null
          employer_id: string | null
          id: string
          is_primary: boolean | null
          notes: string | null
          trade_type: Database["public"]["Enums"]["trade_type"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          employer_id?: string | null
          id?: string
          is_primary?: boolean | null
          notes?: string | null
          trade_type: Database["public"]["Enums"]["trade_type"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          employer_id?: string | null
          id?: string
          is_primary?: boolean | null
          notes?: string | null
          trade_type?: Database["public"]["Enums"]["trade_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contractor_trade_capabilities_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "employer_analytics"
            referencedColumns: ["employer_id"]
          },
          {
            foreignKeyName: "contractor_trade_capabilities_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "employers"
            referencedColumns: ["id"]
          },
        ]
      }
      delegate_field_permissions: {
        Row: {
          can_edit: boolean
          created_at: string
          entity_field_id: string
          id: string
          organiser_id: string
          updated_at: string
        }
        Insert: {
          can_edit?: boolean
          created_at?: string
          entity_field_id: string
          id?: string
          organiser_id: string
          updated_at?: string
        }
        Update: {
          can_edit?: boolean
          created_at?: string
          entity_field_id?: string
          id?: string
          organiser_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "delegate_field_permissions_entity_field_id_fkey"
            columns: ["entity_field_id"]
            isOneToOne: false
            referencedRelation: "entity_fields"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delegate_field_permissions_organiser_id_fkey"
            columns: ["organiser_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      employer_organisers: {
        Row: {
          created_at: string
          employer_id: string
          id: string
          organiser_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          employer_id: string
          id?: string
          organiser_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          employer_id?: string
          id?: string
          organiser_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employer_organisers_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "employer_analytics"
            referencedColumns: ["employer_id"]
          },
          {
            foreignKeyName: "employer_organisers_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "employers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employer_organisers_organiser_id_fkey"
            columns: ["organiser_id"]
            isOneToOne: false
            referencedRelation: "organisers"
            referencedColumns: ["id"]
          },
        ]
      }
      employer_role_tags: {
        Row: {
          created_at: string
          employer_id: string
          id: string
          tag: Database["public"]["Enums"]["employer_role_tag"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          employer_id: string
          id?: string
          tag: Database["public"]["Enums"]["employer_role_tag"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          employer_id?: string
          id?: string
          tag?: Database["public"]["Enums"]["employer_role_tag"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employer_role_tags_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "employer_analytics"
            referencedColumns: ["employer_id"]
          },
          {
            foreignKeyName: "employer_role_tags_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "employers"
            referencedColumns: ["id"]
          },
        ]
      }
      employers: {
        Row: {
          abn: string | null
          address_line_1: string | null
          address_line_2: string | null
          contact_notes: string | null
          created_at: string | null
          email: string | null
          employer_type: Database["public"]["Enums"]["employer_type"]
          enterprise_agreement_status: boolean | null
          estimated_worker_count: number | null
          id: string
          name: string
          parent_employer_id: string | null
          phone: string | null
          postcode: string | null
          primary_contact_name: string | null
          state: string | null
          suburb: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          abn?: string | null
          address_line_1?: string | null
          address_line_2?: string | null
          contact_notes?: string | null
          created_at?: string | null
          email?: string | null
          employer_type: Database["public"]["Enums"]["employer_type"]
          enterprise_agreement_status?: boolean | null
          estimated_worker_count?: number | null
          id?: string
          name: string
          parent_employer_id?: string | null
          phone?: string | null
          postcode?: string | null
          primary_contact_name?: string | null
          state?: string | null
          suburb?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          abn?: string | null
          address_line_1?: string | null
          address_line_2?: string | null
          contact_notes?: string | null
          created_at?: string | null
          email?: string | null
          employer_type?: Database["public"]["Enums"]["employer_type"]
          enterprise_agreement_status?: boolean | null
          estimated_worker_count?: number | null
          id?: string
          name?: string
          parent_employer_id?: string | null
          phone?: string | null
          postcode?: string | null
          primary_contact_name?: string | null
          state?: string | null
          suburb?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employers_parent_employer_id_fkey"
            columns: ["parent_employer_id"]
            isOneToOne: false
            referencedRelation: "employer_analytics"
            referencedColumns: ["employer_id"]
          },
          {
            foreignKeyName: "employers_parent_employer_id_fkey"
            columns: ["parent_employer_id"]
            isOneToOne: false
            referencedRelation: "employers"
            referencedColumns: ["id"]
          },
        ]
      }
      entity_fields: {
        Row: {
          created_at: string
          default_editable: boolean
          default_viewable: boolean
          entity_type: string
          field_label: string
          field_name: string
          field_type: string
          id: string
          is_required: boolean
          is_sensitive: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          default_editable?: boolean
          default_viewable?: boolean
          entity_type: string
          field_label: string
          field_name: string
          field_type: string
          id?: string
          is_required?: boolean
          is_sensitive?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          default_editable?: boolean
          default_viewable?: boolean
          entity_type?: string
          field_label?: string
          field_name?: string
          field_type?: string
          id?: string
          is_required?: boolean
          is_sensitive?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      field_permissions: {
        Row: {
          can_edit: boolean
          can_view: boolean
          created_at: string
          entity_field_id: string
          id: string
          role: string
          updated_at: string
        }
        Insert: {
          can_edit?: boolean
          can_view?: boolean
          created_at?: string
          entity_field_id: string
          id?: string
          role: string
          updated_at?: string
        }
        Update: {
          can_edit?: boolean
          can_view?: boolean
          created_at?: string
          entity_field_id?: string
          id?: string
          role?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "field_permissions_entity_field_id_fkey"
            columns: ["entity_field_id"]
            isOneToOne: false
            referencedRelation: "entity_fields"
            referencedColumns: ["id"]
          },
        ]
      }
      job_sites: {
        Row: {
          created_at: string | null
          full_address: string | null
          geom: unknown | null
          id: string
          is_main_site: boolean | null
          latitude: number | null
          location: string
          longitude: number | null
          main_builder_id: string | null
          name: string
          patch_id: string | null
          project_id: string | null
          project_type: string | null
          shifts: Database["public"]["Enums"]["shift_type"][] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          full_address?: string | null
          geom?: unknown | null
          id?: string
          is_main_site?: boolean | null
          latitude?: number | null
          location: string
          longitude?: number | null
          main_builder_id?: string | null
          name: string
          patch_id?: string | null
          project_id?: string | null
          project_type?: string | null
          shifts?: Database["public"]["Enums"]["shift_type"][] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          full_address?: string | null
          geom?: unknown | null
          id?: string
          is_main_site?: boolean | null
          latitude?: number | null
          location?: string
          longitude?: number | null
          main_builder_id?: string | null
          name?: string
          patch_id?: string | null
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
            referencedRelation: "employer_analytics"
            referencedColumns: ["employer_id"]
          },
          {
            foreignKeyName: "job_sites_main_builder_id_fkey"
            columns: ["main_builder_id"]
            isOneToOne: false
            referencedRelation: "employers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_sites_patch_id_fkey"
            columns: ["patch_id"]
            isOneToOne: false
            referencedRelation: "patches"
            referencedColumns: ["id"]
          },
        ]
      }
      organiser_allocations: {
        Row: {
          allocated_by: string | null
          created_at: string
          end_date: string | null
          entity_id: string
          entity_type: string
          id: string
          is_active: boolean
          notes: string | null
          organiser_id: string
          start_date: string
          updated_at: string
        }
        Insert: {
          allocated_by?: string | null
          created_at?: string
          end_date?: string | null
          entity_id: string
          entity_type: string
          id?: string
          is_active?: boolean
          notes?: string | null
          organiser_id: string
          start_date?: string
          updated_at?: string
        }
        Update: {
          allocated_by?: string | null
          created_at?: string
          end_date?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          is_active?: boolean
          notes?: string | null
          organiser_id?: string
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organiser_allocations_allocated_by_fkey"
            columns: ["allocated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organiser_allocations_organiser_id_fkey"
            columns: ["organiser_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      overlay_images: {
        Row: {
          created_at: string
          created_by: string | null
          file_path: string
          id: string
          image_height: number | null
          image_width: number | null
          is_active: boolean
          notes: string | null
          target_corners: Json | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          file_path: string
          id?: string
          image_height?: number | null
          image_width?: number | null
          is_active?: boolean
          notes?: string | null
          target_corners?: Json | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          file_path?: string
          id?: string
          image_height?: number | null
          image_width?: number | null
          is_active?: boolean
          notes?: string | null
          target_corners?: Json | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "overlay_images_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "overlay_images_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      patches: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          geom: unknown | null
          id: string
          name: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          geom?: unknown | null
          id?: string
          name?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          geom?: unknown | null
          id?: string
          name?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patches_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patches_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pending_users: {
        Row: {
          created_at: string
          created_by: string | null
          email: string
          full_name: string | null
          id: string
          invited_at: string | null
          notes: string | null
          role: string
          scoped_employers: string[] | null
          scoped_sites: string[] | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          email: string
          full_name?: string | null
          id?: string
          invited_at?: string | null
          notes?: string | null
          role?: string
          scoped_employers?: string[] | null
          scoped_sites?: string[] | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          email?: string
          full_name?: string | null
          id?: string
          invited_at?: string | null
          notes?: string | null
          role?: string
          scoped_employers?: string[] | null
          scoped_sites?: string[] | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pending_users_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      permission_audit_log: {
        Row: {
          access_method: string | null
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string
          field_name: string | null
          id: string
          new_value: string | null
          old_value: string | null
          user_id: string | null
        }
        Insert: {
          access_method?: string | null
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          field_name?: string | null
          id?: string
          new_value?: string | null
          old_value?: string | null
          user_id?: string | null
        }
        Update: {
          access_method?: string | null
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          field_name?: string | null
          id?: string
          new_value?: string | null
          old_value?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "permission_audit_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          is_active: boolean
          last_login_at: string | null
          phone: string | null
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
          is_active?: boolean
          last_login_at?: string | null
          phone?: string | null
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
          is_active?: boolean
          last_login_at?: string | null
          phone?: string | null
          role?: string | null
          scoped_employers?: string[] | null
          scoped_sites?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      project_builder_jv: {
        Row: {
          created_at: string
          id: string
          label: string | null
          project_id: string
          status: Database["public"]["Enums"]["jv_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          label?: string | null
          project_id: string
          status?: Database["public"]["Enums"]["jv_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string | null
          project_id?: string
          status?: Database["public"]["Enums"]["jv_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_builder_jv_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_contractor_trades: {
        Row: {
          created_at: string
          eba_signatory: Database["public"]["Enums"]["eba_status_type"]
          employer_id: string
          end_date: string | null
          id: string
          project_id: string
          start_date: string | null
          trade_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          eba_signatory?: Database["public"]["Enums"]["eba_status_type"]
          employer_id: string
          end_date?: string | null
          id?: string
          project_id: string
          start_date?: string | null
          trade_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          eba_signatory?: Database["public"]["Enums"]["eba_status_type"]
          employer_id?: string
          end_date?: string | null
          id?: string
          project_id?: string
          start_date?: string | null
          trade_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_contractor_trades_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "employer_analytics"
            referencedColumns: ["employer_id"]
          },
          {
            foreignKeyName: "project_contractor_trades_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "employers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_contractor_trades_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
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
      project_employer_roles: {
        Row: {
          created_at: string
          employer_id: string
          end_date: string | null
          id: string
          project_id: string
          role: Database["public"]["Enums"]["project_role"]
          start_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          employer_id: string
          end_date?: string | null
          id?: string
          project_id: string
          role: Database["public"]["Enums"]["project_role"]
          start_date?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          employer_id?: string
          end_date?: string | null
          id?: string
          project_id?: string
          role?: Database["public"]["Enums"]["project_role"]
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_employer_roles_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "employer_analytics"
            referencedColumns: ["employer_id"]
          },
          {
            foreignKeyName: "project_employer_roles_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "employers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_employer_roles_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
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
            referencedRelation: "employer_analytics"
            referencedColumns: ["employer_id"]
          },
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
      role_hierarchy: {
        Row: {
          assigned_by: string | null
          child_user_id: string
          created_at: string
          end_date: string | null
          id: string
          is_active: boolean
          parent_user_id: string
          start_date: string
          updated_at: string
        }
        Insert: {
          assigned_by?: string | null
          child_user_id: string
          created_at?: string
          end_date?: string | null
          id?: string
          is_active?: boolean
          parent_user_id: string
          start_date?: string
          updated_at?: string
        }
        Update: {
          assigned_by?: string | null
          child_user_id?: string
          created_at?: string
          end_date?: string | null
          id?: string
          is_active?: boolean
          parent_user_id?: string
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_hierarchy_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_hierarchy_child_user_id_fkey"
            columns: ["child_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_hierarchy_parent_user_id_fkey"
            columns: ["parent_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          eba_signatory: Database["public"]["Enums"]["eba_status_type"] | null
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
          eba_signatory?: Database["public"]["Enums"]["eba_status_type"] | null
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
          eba_signatory?: Database["public"]["Enums"]["eba_status_type"] | null
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
            referencedRelation: "employer_analytics"
            referencedColumns: ["employer_id"]
          },
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
            referencedRelation: "employer_analytics"
            referencedColumns: ["employer_id"]
          },
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
      spatial_ref_sys: {
        Row: {
          auth_name: string | null
          auth_srid: number | null
          proj4text: string | null
          srid: number
          srtext: string | null
        }
        Insert: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid: number
          srtext?: string | null
        }
        Update: {
          auth_name?: string | null
          auth_srid?: number | null
          proj4text?: string | null
          srid?: number
          srtext?: string | null
        }
        Relationships: []
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
            referencedRelation: "unallocated_workers_analysis"
            referencedColumns: ["id"]
          },
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
          assignment_metadata: Json | null
          created_at: string | null
          custom_activity_type: string | null
          date: string
          id: string
          job_site_id: string | null
          notes: string | null
          template_id: string | null
          topic: string | null
          total_delegates: number | null
          total_participants: number | null
          updated_at: string | null
        }
        Insert: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          assignment_metadata?: Json | null
          created_at?: string | null
          custom_activity_type?: string | null
          date: string
          id?: string
          job_site_id?: string | null
          notes?: string | null
          template_id?: string | null
          topic?: string | null
          total_delegates?: number | null
          total_participants?: number | null
          updated_at?: string | null
        }
        Update: {
          activity_type?: Database["public"]["Enums"]["activity_type"]
          assignment_metadata?: Json | null
          created_at?: string | null
          custom_activity_type?: string | null
          date?: string
          id?: string
          job_site_id?: string | null
          notes?: string | null
          template_id?: string | null
          topic?: string | null
          total_delegates?: number | null
          total_participants?: number | null
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
            referencedRelation: "unallocated_workers_analysis"
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
      user_role_assignments: {
        Row: {
          assigned_by: string | null
          created_at: string
          end_date: string | null
          id: string
          is_active: boolean
          notes: string | null
          role: string
          start_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_by?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          is_active?: boolean
          notes?: string | null
          role: string
          start_date?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_by?: string | null
          created_at?: string
          end_date?: string | null
          id?: string
          is_active?: boolean
          notes?: string | null
          role?: string
          start_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_role_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_role_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
            referencedRelation: "unallocated_workers_analysis"
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
      worker_delegate_assignments: {
        Row: {
          assigned_by: string
          created_at: string
          delegate_id: string
          end_date: string | null
          id: string
          is_active: boolean
          notes: string | null
          start_date: string
          updated_at: string
          worker_id: string
        }
        Insert: {
          assigned_by: string
          created_at?: string
          delegate_id: string
          end_date?: string | null
          id?: string
          is_active?: boolean
          notes?: string | null
          start_date?: string
          updated_at?: string
          worker_id: string
        }
        Update: {
          assigned_by?: string
          created_at?: string
          delegate_id?: string
          end_date?: string | null
          id?: string
          is_active?: boolean
          notes?: string | null
          start_date?: string
          updated_at?: string
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "worker_delegate_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "worker_delegate_assignments_delegate_id_fkey"
            columns: ["delegate_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "worker_delegate_assignments_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "unallocated_workers_analysis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "worker_delegate_assignments_worker_id_fkey"
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
            referencedRelation: "employer_analytics"
            referencedColumns: ["employer_id"]
          },
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
            referencedRelation: "unallocated_workers_analysis"
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
          member_number: string | null
          mobile_phone: string | null
          nickname: string | null
          organiser_id: string | null
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
          member_number?: string | null
          mobile_phone?: string | null
          nickname?: string | null
          organiser_id?: string | null
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
          member_number?: string | null
          mobile_phone?: string | null
          nickname?: string | null
          organiser_id?: string | null
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
        Relationships: [
          {
            foreignKeyName: "workers_organiser_id_fkey"
            columns: ["organiser_id"]
            isOneToOne: false
            referencedRelation: "organisers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      employer_analytics: {
        Row: {
          current_worker_count: number | null
          employer_id: string | null
          employer_name: string | null
          estimated_density_percent: number | null
          estimated_worker_count: number | null
          member_count: number | null
          member_density_percent: number | null
          workers_with_job_site: number | null
          workers_without_job_site: number | null
        }
        Relationships: []
      }
      geography_columns: {
        Row: {
          coord_dimension: number | null
          f_geography_column: unknown | null
          f_table_catalog: unknown | null
          f_table_name: unknown | null
          f_table_schema: unknown | null
          srid: number | null
          type: string | null
        }
        Relationships: []
      }
      geometry_columns: {
        Row: {
          coord_dimension: number | null
          f_geometry_column: unknown | null
          f_table_catalog: string | null
          f_table_name: unknown | null
          f_table_schema: unknown | null
          srid: number | null
          type: string | null
        }
        Insert: {
          coord_dimension?: number | null
          f_geometry_column?: unknown | null
          f_table_catalog?: string | null
          f_table_name?: unknown | null
          f_table_schema?: unknown | null
          srid?: number | null
          type?: string | null
        }
        Update: {
          coord_dimension?: number | null
          f_geometry_column?: unknown | null
          f_table_catalog?: string | null
          f_table_name?: unknown | null
          f_table_schema?: unknown | null
          srid?: number | null
          type?: string | null
        }
        Relationships: []
      }
      unallocated_workers_analysis: {
        Row: {
          allocation_status: string | null
          email: string | null
          employer_id: string | null
          employer_name: string | null
          first_name: string | null
          id: string | null
          job_site_id: string | null
          job_site_name: string | null
          member_number: string | null
          mobile_phone: string | null
          surname: string | null
          union_membership_status:
            | Database["public"]["Enums"]["union_membership_status"]
            | null
        }
        Relationships: [
          {
            foreignKeyName: "worker_placements_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "employer_analytics"
            referencedColumns: ["employer_id"]
          },
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
        ]
      }
      v_project_current_roles: {
        Row: {
          employer_id: string | null
          project_id: string | null
          role: Database["public"]["Enums"]["project_role"] | null
        }
        Insert: {
          employer_id?: string | null
          project_id?: string | null
          role?: Database["public"]["Enums"]["project_role"] | null
        }
        Update: {
          employer_id?: string | null
          project_id?: string | null
          role?: Database["public"]["Enums"]["project_role"] | null
        }
        Relationships: [
          {
            foreignKeyName: "project_employer_roles_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "employer_analytics"
            referencedColumns: ["employer_id"]
          },
          {
            foreignKeyName: "project_employer_roles_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "employers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_employer_roles_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      v_project_site_contractors: {
        Row: {
          eba_signatory: string | null
          eba_status: boolean | null
          employer_id: string | null
          end_date: string | null
          job_site_id: string | null
          project_id: string | null
          start_date: string | null
          trade_type: string | null
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
            foreignKeyName: "site_contractor_trades_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "employer_analytics"
            referencedColumns: ["employer_id"]
          },
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
      v_project_workers: {
        Row: {
          employer_id: string | null
          employment_status: string | null
          end_date: string | null
          job_site_id: string | null
          project_id: string | null
          start_date: string | null
          worker_id: string | null
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
            foreignKeyName: "worker_placements_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "employer_analytics"
            referencedColumns: ["employer_id"]
          },
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
            referencedRelation: "unallocated_workers_analysis"
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
    }
    Functions: {
      _postgis_deprecate: {
        Args: { oldname: string; newname: string; version: string }
        Returns: undefined
      }
      _postgis_index_extent: {
        Args: { tbl: unknown; col: string }
        Returns: unknown
      }
      _postgis_pgsql_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      _postgis_scripts_pgsql_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      _postgis_selectivity: {
        Args: { tbl: unknown; att_name: string; geom: unknown; mode?: string }
        Returns: number
      }
      _st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_bestsrid: {
        Args: { "": unknown }
        Returns: number
      }
      _st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_coveredby: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_covers: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      _st_equals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_intersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      _st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      _st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      _st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_pointoutside: {
        Args: { "": unknown }
        Returns: unknown
      }
      _st_sortablehash: {
        Args: { geom: unknown }
        Returns: number
      }
      _st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      _st_voronoi: {
        Args: {
          g1: unknown
          clip?: unknown
          tolerance?: number
          return_polygons?: boolean
        }
        Returns: unknown
      }
      _st_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      addauth: {
        Args: { "": string }
        Returns: boolean
      }
      addgeometrycolumn: {
        Args:
          | {
              catalog_name: string
              schema_name: string
              table_name: string
              column_name: string
              new_srid_in: number
              new_type: string
              new_dim: number
              use_typmod?: boolean
            }
          | {
              schema_name: string
              table_name: string
              column_name: string
              new_srid: number
              new_type: string
              new_dim: number
              use_typmod?: boolean
            }
          | {
              table_name: string
              column_name: string
              new_srid: number
              new_type: string
              new_dim: number
              use_typmod?: boolean
            }
        Returns: string
      }
      admin_update_user_scoping: {
        Args: {
          _user_id: string
          _scoped_employers: string[]
          _scoped_sites: string[]
        }
        Returns: undefined
      }
      apply_pending_user_on_login: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      assign_patches_for_all_job_sites: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      box: {
        Args: { "": unknown } | { "": unknown }
        Returns: unknown
      }
      box2d: {
        Args: { "": unknown } | { "": unknown }
        Returns: unknown
      }
      box2d_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      box2d_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      box2df_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      box2df_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      box3d: {
        Args: { "": unknown } | { "": unknown }
        Returns: unknown
      }
      box3d_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      box3d_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      box3dtobox: {
        Args: { "": unknown }
        Returns: unknown
      }
      bytea: {
        Args: { "": unknown } | { "": unknown }
        Returns: string
      }
      delete_project_cascade: {
        Args: { p_project_id: string }
        Returns: undefined
      }
      disablelongtransactions: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      dropgeometrycolumn: {
        Args:
          | {
              catalog_name: string
              schema_name: string
              table_name: string
              column_name: string
            }
          | { schema_name: string; table_name: string; column_name: string }
          | { table_name: string; column_name: string }
        Returns: string
      }
      dropgeometrytable: {
        Args:
          | { catalog_name: string; schema_name: string; table_name: string }
          | { schema_name: string; table_name: string }
          | { table_name: string }
        Returns: string
      }
      enablelongtransactions: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      equals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geography: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      geography_analyze: {
        Args: { "": unknown }
        Returns: boolean
      }
      geography_gist_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      geography_gist_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      geography_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      geography_send: {
        Args: { "": unknown }
        Returns: string
      }
      geography_spgist_compress_nd: {
        Args: { "": unknown }
        Returns: unknown
      }
      geography_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      geography_typmod_out: {
        Args: { "": number }
        Returns: unknown
      }
      geometry: {
        Args:
          | { "": string }
          | { "": string }
          | { "": unknown }
          | { "": unknown }
          | { "": unknown }
          | { "": unknown }
          | { "": unknown }
          | { "": unknown }
        Returns: unknown
      }
      geometry_above: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_analyze: {
        Args: { "": unknown }
        Returns: boolean
      }
      geometry_below: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_cmp: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_contained_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_contains_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_distance_box: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_distance_centroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      geometry_eq: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_ge: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_gist_compress_2d: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_gist_compress_nd: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_gist_decompress_2d: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_gist_decompress_nd: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_gist_sortsupport_2d: {
        Args: { "": unknown }
        Returns: undefined
      }
      geometry_gt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_hash: {
        Args: { "": unknown }
        Returns: number
      }
      geometry_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_le: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_left: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_lt: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_overabove: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overbelow: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overlaps_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overleft: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_overright: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_recv: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_right: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_same_3d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometry_send: {
        Args: { "": unknown }
        Returns: string
      }
      geometry_sortsupport: {
        Args: { "": unknown }
        Returns: undefined
      }
      geometry_spgist_compress_2d: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_spgist_compress_3d: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_spgist_compress_nd: {
        Args: { "": unknown }
        Returns: unknown
      }
      geometry_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      geometry_typmod_out: {
        Args: { "": number }
        Returns: unknown
      }
      geometry_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      geometrytype: {
        Args: { "": unknown } | { "": unknown }
        Returns: string
      }
      geomfromewkb: {
        Args: { "": string }
        Returns: unknown
      }
      geomfromewkt: {
        Args: { "": string }
        Returns: unknown
      }
      get_proj4_from_srid: {
        Args: { "": number }
        Returns: string
      }
      get_project_delete_impact: {
        Args: { p_project_id: string }
        Returns: {
          site_count: number
          site_contractor_trades_count: number
          site_contacts_count: number
          site_employers_count: number
          union_activities_count: number
          worker_placements_count: number
          project_contractor_trades_count: number
          project_employer_roles_count: number
          project_organisers_count: number
          project_builder_jv_count: number
          project_eba_details_count: number
        }[]
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: string
      }
      gettransactionid: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      gidx_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gidx_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      has_role: {
        Args: { _user_id: string; _role: string }
        Returns: boolean
      }
      has_site_access: {
        Args: { user_id: string; site_id: string }
        Returns: boolean
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_lead_of: {
        Args: { _parent: string; _child: string }
        Returns: boolean
      }
      json: {
        Args: { "": unknown }
        Returns: Json
      }
      jsonb: {
        Args: { "": unknown }
        Returns: Json
      }
      longtransactionsenabled: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      path: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_asflatgeobuf_finalfn: {
        Args: { "": unknown }
        Returns: string
      }
      pgis_asgeobuf_finalfn: {
        Args: { "": unknown }
        Returns: string
      }
      pgis_asmvt_finalfn: {
        Args: { "": unknown }
        Returns: string
      }
      pgis_asmvt_serialfn: {
        Args: { "": unknown }
        Returns: string
      }
      pgis_geometry_clusterintersecting_finalfn: {
        Args: { "": unknown }
        Returns: unknown[]
      }
      pgis_geometry_clusterwithin_finalfn: {
        Args: { "": unknown }
        Returns: unknown[]
      }
      pgis_geometry_collect_finalfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_geometry_makeline_finalfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_geometry_polygonize_finalfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_geometry_union_parallel_finalfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      pgis_geometry_union_parallel_serialfn: {
        Args: { "": unknown }
        Returns: string
      }
      point: {
        Args: { "": unknown }
        Returns: unknown
      }
      polygon: {
        Args: { "": unknown }
        Returns: unknown
      }
      populate_geometry_columns: {
        Args:
          | { tbl_oid: unknown; use_typmod?: boolean }
          | { use_typmod?: boolean }
        Returns: number
      }
      postgis_addbbox: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_constraint_dims: {
        Args: { geomschema: string; geomtable: string; geomcolumn: string }
        Returns: number
      }
      postgis_constraint_srid: {
        Args: { geomschema: string; geomtable: string; geomcolumn: string }
        Returns: number
      }
      postgis_constraint_type: {
        Args: { geomschema: string; geomtable: string; geomcolumn: string }
        Returns: string
      }
      postgis_dropbbox: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_extensions_upgrade: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_full_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_geos_noop: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_geos_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_getbbox: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_hasbbox: {
        Args: { "": unknown }
        Returns: boolean
      }
      postgis_index_supportfn: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_lib_build_date: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_lib_revision: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_lib_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_libjson_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_liblwgeom_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_libprotobuf_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_libxml_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_noop: {
        Args: { "": unknown }
        Returns: unknown
      }
      postgis_proj_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_scripts_build_date: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_scripts_installed: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_scripts_released: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_svn_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_type_name: {
        Args: {
          geomname: string
          coord_dimension: number
          use_new_name?: boolean
        }
        Returns: string
      }
      postgis_typmod_dims: {
        Args: { "": number }
        Returns: number
      }
      postgis_typmod_srid: {
        Args: { "": number }
        Returns: number
      }
      postgis_typmod_type: {
        Args: { "": number }
        Returns: string
      }
      postgis_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      postgis_wagyu_version: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      spheroid_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      spheroid_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_3dclosestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3ddistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dintersects: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_3dlength: {
        Args: { "": unknown }
        Returns: number
      }
      st_3dlongestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmakebox: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_3dmaxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_3dperimeter: {
        Args: { "": unknown }
        Returns: number
      }
      st_3dshortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_addpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_angle: {
        Args:
          | { line1: unknown; line2: unknown }
          | { pt1: unknown; pt2: unknown; pt3: unknown; pt4?: unknown }
        Returns: number
      }
      st_area: {
        Args:
          | { "": string }
          | { "": unknown }
          | { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_area2d: {
        Args: { "": unknown }
        Returns: number
      }
      st_asbinary: {
        Args: { "": unknown } | { "": unknown }
        Returns: string
      }
      st_asencodedpolyline: {
        Args: { geom: unknown; nprecision?: number }
        Returns: string
      }
      st_asewkb: {
        Args: { "": unknown }
        Returns: string
      }
      st_asewkt: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      st_asgeojson: {
        Args:
          | { "": string }
          | { geog: unknown; maxdecimaldigits?: number; options?: number }
          | { geom: unknown; maxdecimaldigits?: number; options?: number }
          | {
              r: Record<string, unknown>
              geom_column?: string
              maxdecimaldigits?: number
              pretty_bool?: boolean
            }
        Returns: string
      }
      st_asgml: {
        Args:
          | { "": string }
          | {
              geog: unknown
              maxdecimaldigits?: number
              options?: number
              nprefix?: string
              id?: string
            }
          | { geom: unknown; maxdecimaldigits?: number; options?: number }
          | {
              version: number
              geog: unknown
              maxdecimaldigits?: number
              options?: number
              nprefix?: string
              id?: string
            }
          | {
              version: number
              geom: unknown
              maxdecimaldigits?: number
              options?: number
              nprefix?: string
              id?: string
            }
        Returns: string
      }
      st_ashexewkb: {
        Args: { "": unknown }
        Returns: string
      }
      st_askml: {
        Args:
          | { "": string }
          | { geog: unknown; maxdecimaldigits?: number; nprefix?: string }
          | { geom: unknown; maxdecimaldigits?: number; nprefix?: string }
        Returns: string
      }
      st_aslatlontext: {
        Args: { geom: unknown; tmpl?: string }
        Returns: string
      }
      st_asmarc21: {
        Args: { geom: unknown; format?: string }
        Returns: string
      }
      st_asmvtgeom: {
        Args: {
          geom: unknown
          bounds: unknown
          extent?: number
          buffer?: number
          clip_geom?: boolean
        }
        Returns: unknown
      }
      st_assvg: {
        Args:
          | { "": string }
          | { geog: unknown; rel?: number; maxdecimaldigits?: number }
          | { geom: unknown; rel?: number; maxdecimaldigits?: number }
        Returns: string
      }
      st_astext: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      st_astwkb: {
        Args:
          | {
              geom: unknown[]
              ids: number[]
              prec?: number
              prec_z?: number
              prec_m?: number
              with_sizes?: boolean
              with_boxes?: boolean
            }
          | {
              geom: unknown
              prec?: number
              prec_z?: number
              prec_m?: number
              with_sizes?: boolean
              with_boxes?: boolean
            }
        Returns: string
      }
      st_asx3d: {
        Args: { geom: unknown; maxdecimaldigits?: number; options?: number }
        Returns: string
      }
      st_azimuth: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_boundary: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_boundingdiagonal: {
        Args: { geom: unknown; fits?: boolean }
        Returns: unknown
      }
      st_buffer: {
        Args:
          | { geom: unknown; radius: number; options?: string }
          | { geom: unknown; radius: number; quadsegs: number }
        Returns: unknown
      }
      st_buildarea: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_centroid: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      st_cleangeometry: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_clipbybox2d: {
        Args: { geom: unknown; box: unknown }
        Returns: unknown
      }
      st_closestpoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_clusterintersecting: {
        Args: { "": unknown[] }
        Returns: unknown[]
      }
      st_collect: {
        Args: { "": unknown[] } | { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_collectionextract: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_collectionhomogenize: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_concavehull: {
        Args: {
          param_geom: unknown
          param_pctconvex: number
          param_allow_holes?: boolean
        }
        Returns: unknown
      }
      st_contains: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_containsproperly: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_convexhull: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_coorddim: {
        Args: { geometry: unknown }
        Returns: number
      }
      st_coveredby: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_covers: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_crosses: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_curvetoline: {
        Args: { geom: unknown; tol?: number; toltype?: number; flags?: number }
        Returns: unknown
      }
      st_delaunaytriangles: {
        Args: { g1: unknown; tolerance?: number; flags?: number }
        Returns: unknown
      }
      st_difference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_dimension: {
        Args: { "": unknown }
        Returns: number
      }
      st_disjoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_distance: {
        Args:
          | { geog1: unknown; geog2: unknown; use_spheroid?: boolean }
          | { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_distancesphere: {
        Args:
          | { geom1: unknown; geom2: unknown }
          | { geom1: unknown; geom2: unknown; radius: number }
        Returns: number
      }
      st_distancespheroid: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_dump: {
        Args: { "": unknown }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dumppoints: {
        Args: { "": unknown }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dumprings: {
        Args: { "": unknown }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dumpsegments: {
        Args: { "": unknown }
        Returns: Database["public"]["CompositeTypes"]["geometry_dump"][]
      }
      st_dwithin: {
        Args: {
          geog1: unknown
          geog2: unknown
          tolerance: number
          use_spheroid?: boolean
        }
        Returns: boolean
      }
      st_endpoint: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_envelope: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_equals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_expand: {
        Args:
          | { box: unknown; dx: number; dy: number }
          | { box: unknown; dx: number; dy: number; dz?: number }
          | { geom: unknown; dx: number; dy: number; dz?: number; dm?: number }
        Returns: unknown
      }
      st_exteriorring: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_flipcoordinates: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_force2d: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_force3d: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force3dm: {
        Args: { geom: unknown; mvalue?: number }
        Returns: unknown
      }
      st_force3dz: {
        Args: { geom: unknown; zvalue?: number }
        Returns: unknown
      }
      st_force4d: {
        Args: { geom: unknown; zvalue?: number; mvalue?: number }
        Returns: unknown
      }
      st_forcecollection: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcecurve: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcepolygonccw: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcepolygoncw: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcerhr: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_forcesfs: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_generatepoints: {
        Args:
          | { area: unknown; npoints: number }
          | { area: unknown; npoints: number; seed: number }
        Returns: unknown
      }
      st_geogfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geogfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_geographyfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geohash: {
        Args:
          | { geog: unknown; maxchars?: number }
          | { geom: unknown; maxchars?: number }
        Returns: string
      }
      st_geomcollfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomcollfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_geometricmedian: {
        Args: {
          g: unknown
          tolerance?: number
          max_iter?: number
          fail_if_not_converged?: boolean
        }
        Returns: unknown
      }
      st_geometryfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geometrytype: {
        Args: { "": unknown }
        Returns: string
      }
      st_geomfromewkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromewkt: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromgeojson: {
        Args: { "": Json } | { "": Json } | { "": string }
        Returns: unknown
      }
      st_geomfromgml: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromkml: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfrommarc21: {
        Args: { marc21xml: string }
        Returns: unknown
      }
      st_geomfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromtwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_geomfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_gmltosql: {
        Args: { "": string }
        Returns: unknown
      }
      st_hasarc: {
        Args: { geometry: unknown }
        Returns: boolean
      }
      st_hausdorffdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_hexagon: {
        Args: { size: number; cell_i: number; cell_j: number; origin?: unknown }
        Returns: unknown
      }
      st_hexagongrid: {
        Args: { size: number; bounds: unknown }
        Returns: Record<string, unknown>[]
      }
      st_interpolatepoint: {
        Args: { line: unknown; point: unknown }
        Returns: number
      }
      st_intersection: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_intersects: {
        Args:
          | { geog1: unknown; geog2: unknown }
          | { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_isclosed: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_iscollection: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_isempty: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_ispolygonccw: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_ispolygoncw: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_isring: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_issimple: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_isvalid: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_isvaliddetail: {
        Args: { geom: unknown; flags?: number }
        Returns: Database["public"]["CompositeTypes"]["valid_detail"]
      }
      st_isvalidreason: {
        Args: { "": unknown }
        Returns: string
      }
      st_isvalidtrajectory: {
        Args: { "": unknown }
        Returns: boolean
      }
      st_length: {
        Args:
          | { "": string }
          | { "": unknown }
          | { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_length2d: {
        Args: { "": unknown }
        Returns: number
      }
      st_letters: {
        Args: { letters: string; font?: Json }
        Returns: unknown
      }
      st_linecrossingdirection: {
        Args: { line1: unknown; line2: unknown }
        Returns: number
      }
      st_linefromencodedpolyline: {
        Args: { txtin: string; nprecision?: number }
        Returns: unknown
      }
      st_linefrommultipoint: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_linefromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_linefromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_linelocatepoint: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_linemerge: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_linestringfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_linetocurve: {
        Args: { geometry: unknown }
        Returns: unknown
      }
      st_locatealong: {
        Args: { geometry: unknown; measure: number; leftrightoffset?: number }
        Returns: unknown
      }
      st_locatebetween: {
        Args: {
          geometry: unknown
          frommeasure: number
          tomeasure: number
          leftrightoffset?: number
        }
        Returns: unknown
      }
      st_locatebetweenelevations: {
        Args: { geometry: unknown; fromelevation: number; toelevation: number }
        Returns: unknown
      }
      st_longestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_m: {
        Args: { "": unknown }
        Returns: number
      }
      st_makebox2d: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makeline: {
        Args: { "": unknown[] } | { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_makepolygon: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_makevalid: {
        Args: { "": unknown } | { geom: unknown; params: string }
        Returns: unknown
      }
      st_maxdistance: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: number
      }
      st_maximuminscribedcircle: {
        Args: { "": unknown }
        Returns: Record<string, unknown>
      }
      st_memsize: {
        Args: { "": unknown }
        Returns: number
      }
      st_minimumboundingcircle: {
        Args: { inputgeom: unknown; segs_per_quarter?: number }
        Returns: unknown
      }
      st_minimumboundingradius: {
        Args: { "": unknown }
        Returns: Record<string, unknown>
      }
      st_minimumclearance: {
        Args: { "": unknown }
        Returns: number
      }
      st_minimumclearanceline: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_mlinefromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_mlinefromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_mpointfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_mpointfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_mpolyfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_mpolyfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_multi: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_multilinefromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_multilinestringfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_multipointfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_multipointfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_multipolyfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_multipolygonfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_ndims: {
        Args: { "": unknown }
        Returns: number
      }
      st_node: {
        Args: { g: unknown }
        Returns: unknown
      }
      st_normalize: {
        Args: { geom: unknown }
        Returns: unknown
      }
      st_npoints: {
        Args: { "": unknown }
        Returns: number
      }
      st_nrings: {
        Args: { "": unknown }
        Returns: number
      }
      st_numgeometries: {
        Args: { "": unknown }
        Returns: number
      }
      st_numinteriorring: {
        Args: { "": unknown }
        Returns: number
      }
      st_numinteriorrings: {
        Args: { "": unknown }
        Returns: number
      }
      st_numpatches: {
        Args: { "": unknown }
        Returns: number
      }
      st_numpoints: {
        Args: { "": unknown }
        Returns: number
      }
      st_offsetcurve: {
        Args: { line: unknown; distance: number; params?: string }
        Returns: unknown
      }
      st_orderingequals: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_orientedenvelope: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_overlaps: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_perimeter: {
        Args: { "": unknown } | { geog: unknown; use_spheroid?: boolean }
        Returns: number
      }
      st_perimeter2d: {
        Args: { "": unknown }
        Returns: number
      }
      st_pointfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_pointfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_pointm: {
        Args: {
          xcoordinate: number
          ycoordinate: number
          mcoordinate: number
          srid?: number
        }
        Returns: unknown
      }
      st_pointonsurface: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_points: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_pointz: {
        Args: {
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
          srid?: number
        }
        Returns: unknown
      }
      st_pointzm: {
        Args: {
          xcoordinate: number
          ycoordinate: number
          zcoordinate: number
          mcoordinate: number
          srid?: number
        }
        Returns: unknown
      }
      st_polyfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_polyfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_polygonfromtext: {
        Args: { "": string }
        Returns: unknown
      }
      st_polygonfromwkb: {
        Args: { "": string }
        Returns: unknown
      }
      st_polygonize: {
        Args: { "": unknown[] }
        Returns: unknown
      }
      st_project: {
        Args: { geog: unknown; distance: number; azimuth: number }
        Returns: unknown
      }
      st_quantizecoordinates: {
        Args: {
          g: unknown
          prec_x: number
          prec_y?: number
          prec_z?: number
          prec_m?: number
        }
        Returns: unknown
      }
      st_reduceprecision: {
        Args: { geom: unknown; gridsize: number }
        Returns: unknown
      }
      st_relate: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: string
      }
      st_removerepeatedpoints: {
        Args: { geom: unknown; tolerance?: number }
        Returns: unknown
      }
      st_reverse: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_segmentize: {
        Args: { geog: unknown; max_segment_length: number }
        Returns: unknown
      }
      st_setsrid: {
        Args: { geog: unknown; srid: number } | { geom: unknown; srid: number }
        Returns: unknown
      }
      st_sharedpaths: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_shiftlongitude: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_shortestline: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_simplifypolygonhull: {
        Args: { geom: unknown; vertex_fraction: number; is_outer?: boolean }
        Returns: unknown
      }
      st_split: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_square: {
        Args: { size: number; cell_i: number; cell_j: number; origin?: unknown }
        Returns: unknown
      }
      st_squaregrid: {
        Args: { size: number; bounds: unknown }
        Returns: Record<string, unknown>[]
      }
      st_srid: {
        Args: { geog: unknown } | { geom: unknown }
        Returns: number
      }
      st_startpoint: {
        Args: { "": unknown }
        Returns: unknown
      }
      st_subdivide: {
        Args: { geom: unknown; maxvertices?: number; gridsize?: number }
        Returns: unknown[]
      }
      st_summary: {
        Args: { "": unknown } | { "": unknown }
        Returns: string
      }
      st_swapordinates: {
        Args: { geom: unknown; ords: unknown }
        Returns: unknown
      }
      st_symdifference: {
        Args: { geom1: unknown; geom2: unknown; gridsize?: number }
        Returns: unknown
      }
      st_symmetricdifference: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: unknown
      }
      st_tileenvelope: {
        Args: {
          zoom: number
          x: number
          y: number
          bounds?: unknown
          margin?: number
        }
        Returns: unknown
      }
      st_touches: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_transform: {
        Args:
          | { geom: unknown; from_proj: string; to_proj: string }
          | { geom: unknown; from_proj: string; to_srid: number }
          | { geom: unknown; to_proj: string }
        Returns: unknown
      }
      st_triangulatepolygon: {
        Args: { g1: unknown }
        Returns: unknown
      }
      st_union: {
        Args:
          | { "": unknown[] }
          | { geom1: unknown; geom2: unknown }
          | { geom1: unknown; geom2: unknown; gridsize: number }
        Returns: unknown
      }
      st_voronoilines: {
        Args: { g1: unknown; tolerance?: number; extend_to?: unknown }
        Returns: unknown
      }
      st_voronoipolygons: {
        Args: { g1: unknown; tolerance?: number; extend_to?: unknown }
        Returns: unknown
      }
      st_within: {
        Args: { geom1: unknown; geom2: unknown }
        Returns: boolean
      }
      st_wkbtosql: {
        Args: { wkb: string }
        Returns: unknown
      }
      st_wkttosql: {
        Args: { "": string }
        Returns: unknown
      }
      st_wrapx: {
        Args: { geom: unknown; wrap: number; move: number }
        Returns: unknown
      }
      st_x: {
        Args: { "": unknown }
        Returns: number
      }
      st_xmax: {
        Args: { "": unknown }
        Returns: number
      }
      st_xmin: {
        Args: { "": unknown }
        Returns: number
      }
      st_y: {
        Args: { "": unknown }
        Returns: number
      }
      st_ymax: {
        Args: { "": unknown }
        Returns: number
      }
      st_ymin: {
        Args: { "": unknown }
        Returns: number
      }
      st_z: {
        Args: { "": unknown }
        Returns: number
      }
      st_zmax: {
        Args: { "": unknown }
        Returns: number
      }
      st_zmflag: {
        Args: { "": unknown }
        Returns: number
      }
      st_zmin: {
        Args: { "": unknown }
        Returns: number
      }
      sync_auth_users: {
        Args: Record<PropertyKey, never>
        Returns: {
          synced_count: number
          message: string
        }[]
      }
      text: {
        Args: { "": unknown }
        Returns: string
      }
      unlockrows: {
        Args: { "": string }
        Returns: number
      }
      updategeometrysrid: {
        Args: {
          catalogn_name: string
          schema_name: string
          table_name: string
          column_name: string
          new_srid_in: number
        }
        Returns: string
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
      eba_status_type: "yes" | "no" | "not_specified"
      employer_role_tag: "builder" | "head_contractor"
      employer_type:
        | "individual"
        | "small_contractor"
        | "large_contractor"
        | "principal_contractor"
        | "builder"
      employment_status:
        | "permanent"
        | "casual"
        | "subcontractor"
        | "apprentice"
        | "trainee"
      jv_status: "yes" | "no" | "unsure"
      project_role:
        | "head_contractor"
        | "contractor"
        | "trade_subcontractor"
        | "builder"
      rating_type:
        | "support_level"
        | "leadership"
        | "risk"
        | "activity_participation"
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
        | "tower_crane"
        | "mobile_crane"
        | "post_tensioning"
        | "concreting"
        | "steel_fixing"
        | "bricklaying"
        | "traffic_control"
        | "labour_hire"
        | "windows"
        | "waterproofing"
        | "plastering"
        | "edge_protection"
        | "hoist"
        | "kitchens"
        | "tiling"
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
      geometry_dump: {
        path: number[] | null
        geom: unknown | null
      }
      valid_detail: {
        valid: boolean | null
        reason: string | null
        location: unknown | null
      }
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
      eba_status_type: ["yes", "no", "not_specified"],
      employer_role_tag: ["builder", "head_contractor"],
      employer_type: [
        "individual",
        "small_contractor",
        "large_contractor",
        "principal_contractor",
        "builder",
      ],
      employment_status: [
        "permanent",
        "casual",
        "subcontractor",
        "apprentice",
        "trainee",
      ],
      jv_status: ["yes", "no", "unsure"],
      project_role: [
        "head_contractor",
        "contractor",
        "trade_subcontractor",
        "builder",
      ],
      rating_type: [
        "support_level",
        "leadership",
        "risk",
        "activity_participation",
      ],
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
        "tower_crane",
        "mobile_crane",
        "post_tensioning",
        "concreting",
        "steel_fixing",
        "bricklaying",
        "traffic_control",
        "labour_hire",
        "windows",
        "waterproofing",
        "plastering",
        "edge_protection",
        "hoist",
        "kitchens",
        "tiling",
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
