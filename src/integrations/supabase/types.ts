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
    }
    Functions: {
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
      delete_project_cascade: {
        Args: { p_project_id: string }
        Returns: undefined
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
      sync_auth_users: {
        Args: Record<PropertyKey, never>
        Returns: {
          synced_count: number
          message: string
        }[]
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
