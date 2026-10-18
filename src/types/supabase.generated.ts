/* Auto-generated from Supabase project fxxtyfurdzpzfvweoppo. Regenerate after schema changes; do not hand-edit. This file describes types only and contains no row data or secrets. */
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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      account_access_controls: {
        Row: {
          access_disabled: boolean
          admin_note: string | null
          suspended_until: string | null
          updated_at: string
          updated_by: string | null
          user_id: string
        }
        Insert: {
          access_disabled?: boolean
          admin_note?: string | null
          suspended_until?: string | null
          updated_at?: string
          updated_by?: string | null
          user_id: string
        }
        Update: {
          access_disabled?: boolean
          admin_note?: string | null
          suspended_until?: string | null
          updated_at?: string
          updated_by?: string | null
          user_id?: string
        }
        Relationships: []
      }
      account_action_audit_log: {
        Row: {
          action: string
          actor_email: string | null
          actor_user_id: string | null
          created_at: string
          details: Json
          id: number
          target_email: string | null
          target_name: string | null
          target_user_id: string | null
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_user_id?: string | null
          created_at?: string
          details?: Json
          id?: never
          target_email?: string | null
          target_name?: string | null
          target_user_id?: string | null
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_user_id?: string | null
          created_at?: string
          details?: Json
          id?: never
          target_email?: string | null
          target_name?: string | null
          target_user_id?: string | null
        }
        Relationships: []
      }
      activity_logs: {
        Row: {
          action: string
          created_at: string
          description: string | null
          id: number
          record_id: string | null
          table_name: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          description?: string | null
          id?: never
          record_id?: string | null
          table_name?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          description?: string | null
          id?: never
          record_id?: string | null
          table_name?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      app_labels: {
        Row: {
          created_at: string | null
          id: string
          is_enabled: boolean
          label_key: string
          label_value: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_enabled?: boolean
          label_key: string
          label_value: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_enabled?: boolean
          label_key?: string
          label_value?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      app_roles: {
        Row: {
          created_at: string | null
          id: string
          is_system: boolean
          role_key: string
          title: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_system?: boolean
          role_key: string
          title: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_system?: boolean
          role_key?: string
          title?: string
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          id: string
          setting_key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          id?: string
          setting_key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          id?: string
          setting_key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_user_id: string | null
          created_at: string
          id: string
          module_key: string | null
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          created_at?: string
          id?: string
          module_key?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          created_at?: string
          id?: string
          module_key?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
        }
        Relationships: []
      }
      chat_call_signals: {
        Row: {
          call_id: string
          conversation_id: string
          created_at: string
          event_type: string
          id: string
          payload: Json
          recipient_id: string
          sender_id: string
        }
        Insert: {
          call_id: string
          conversation_id: string
          created_at?: string
          event_type: string
          id?: string
          payload?: Json
          recipient_id: string
          sender_id: string
        }
        Update: {
          call_id?: string
          conversation_id?: string
          created_at?: string
          event_type?: string
          id?: string
          payload?: Json
          recipient_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_call_signals_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_conversations: {
        Row: {
          created_at: string
          created_by: string
          id: string
          kind: string
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          kind?: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          kind?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      chat_members: {
        Row: {
          conversation_id: string
          joined_at: string
          last_read_at: string | null
          member_role: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          joined_at?: string
          last_read_at?: string | null
          member_role?: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          joined_at?: string
          last_read_at?: string | null
          member_role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_members_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          body: string
          conversation_id: string | null
          conversation_type: string
          created_at: string
          deleted_at: string | null
          edited_at: string | null
          id: string
          recipient_id: string | null
          sender_id: string
          sender_name: string | null
        }
        Insert: {
          body: string
          conversation_id?: string | null
          conversation_type?: string
          created_at?: string
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          recipient_id?: string | null
          sender_id: string
          sender_name?: string | null
        }
        Update: {
          body?: string
          conversation_id?: string | null
          conversation_type?: string
          created_at?: string
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          recipient_id?: string | null
          sender_id?: string
          sender_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_field_values: {
        Row: {
          created_at: string | null
          field_id: string
          id: string
          record_id: string
          updated_at: string | null
          value_date: string | null
          value_json: Json | null
          value_number: number | null
          value_text: string | null
        }
        Insert: {
          created_at?: string | null
          field_id: string
          id?: string
          record_id: string
          updated_at?: string | null
          value_date?: string | null
          value_json?: Json | null
          value_number?: number | null
          value_text?: string | null
        }
        Update: {
          created_at?: string | null
          field_id?: string
          id?: string
          record_id?: string
          updated_at?: string | null
          value_date?: string | null
          value_json?: Json | null
          value_number?: number | null
          value_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_field_values_field_id_fkey"
            columns: ["field_id"]
            isOneToOne: false
            referencedRelation: "field_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      deployment_costs: {
        Row: {
          amount: number
          cost_type: string
          created_at: string | null
          deployment_id: string
          id: string
          notes: string | null
          status: string
        }
        Insert: {
          amount?: number
          cost_type: string
          created_at?: string | null
          deployment_id: string
          id?: string
          notes?: string | null
          status?: string
        }
        Update: {
          amount?: number
          cost_type?: string
          created_at?: string | null
          deployment_id?: string
          id?: string
          notes?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "deployment_costs_deployment_id_fkey"
            columns: ["deployment_id"]
            isOneToOne: false
            referencedRelation: "deployments"
            referencedColumns: ["id"]
          },
        ]
      }
      deployment_participants: {
        Row: {
          deployment_id: string
          id: string
          khadem_id: string
          role_title: string | null
          vehicle_id: string | null
        }
        Insert: {
          deployment_id: string
          id?: string
          khadem_id: string
          role_title?: string | null
          vehicle_id?: string | null
        }
        Update: {
          deployment_id?: string
          id?: string
          khadem_id?: string
          role_title?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deployment_participants_deployment_id_fkey"
            columns: ["deployment_id"]
            isOneToOne: false
            referencedRelation: "deployments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deployment_participants_khadem_id_fkey"
            columns: ["khadem_id"]
            isOneToOne: false
            referencedRelation: "friday_overdue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deployment_participants_khadem_id_fkey"
            columns: ["khadem_id"]
            isOneToOne: false
            referencedRelation: "khadem_service_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deployment_participants_khadem_id_fkey"
            columns: ["khadem_id"]
            isOneToOne: false
            referencedRelation: "khadems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deployment_participants_khadem_id_fkey"
            columns: ["khadem_id"]
            isOneToOne: false
            referencedRelation: "khadems_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deployment_participants_khadem_id_fkey"
            columns: ["khadem_id"]
            isOneToOne: false
            referencedRelation: "meeting_attendance_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deployment_participants_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      deployments: {
        Row: {
          created_at: string | null
          deployment_date: string
          destination: string | null
          id: string
          notes: string | null
          origin: string | null
          responsible: string | null
          service_type: string | null
          status: string
        }
        Insert: {
          created_at?: string | null
          deployment_date: string
          destination?: string | null
          id?: string
          notes?: string | null
          origin?: string | null
          responsible?: string | null
          service_type?: string | null
          status?: string
        }
        Update: {
          created_at?: string | null
          deployment_date?: string
          destination?: string | null
          id?: string
          notes?: string | null
          origin?: string | null
          responsible?: string | null
          service_type?: string | null
          status?: string
        }
        Relationships: []
      }
      donors: {
        Row: {
          created_at: string | null
          donor_code: string | null
          donor_type: string | null
          full_name: string
          id: string
          is_active: boolean | null
          notes: string | null
          phone: string | null
        }
        Insert: {
          created_at?: string | null
          donor_code?: string | null
          donor_type?: string | null
          full_name: string
          id?: string
          is_active?: boolean | null
          notes?: string | null
          phone?: string | null
        }
        Update: {
          created_at?: string | null
          donor_code?: string | null
          donor_type?: string | null
          full_name?: string
          id?: string
          is_active?: boolean | null
          notes?: string | null
          phone?: string | null
        }
        Relationships: []
      }
      drivers: {
        Row: {
          created_at: string | null
          full_name: string
          id: string
          khadem_id: string | null
          license_no: string | null
          notes: string | null
          phone: string | null
          status: string
        }
        Insert: {
          created_at?: string | null
          full_name: string
          id?: string
          khadem_id?: string | null
          license_no?: string | null
          notes?: string | null
          phone?: string | null
          status?: string
        }
        Update: {
          created_at?: string | null
          full_name?: string
          id?: string
          khadem_id?: string | null
          license_no?: string | null
          notes?: string | null
          phone?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "drivers_khadem_id_fkey"
            columns: ["khadem_id"]
            isOneToOne: false
            referencedRelation: "friday_overdue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drivers_khadem_id_fkey"
            columns: ["khadem_id"]
            isOneToOne: false
            referencedRelation: "khadem_service_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drivers_khadem_id_fkey"
            columns: ["khadem_id"]
            isOneToOne: false
            referencedRelation: "khadems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drivers_khadem_id_fkey"
            columns: ["khadem_id"]
            isOneToOne: false
            referencedRelation: "khadems_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drivers_khadem_id_fkey"
            columns: ["khadem_id"]
            isOneToOne: false
            referencedRelation: "meeting_attendance_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_committee_payments: {
        Row: {
          amount_toman: number
          created_at: string
          created_by: string | null
          finance_transaction_id: string | null
          id: string
          notes: string | null
          paid_date: string
          payment_method: string | null
          receipt_id: string
          reference_no: string | null
        }
        Insert: {
          amount_toman: number
          created_at?: string
          created_by?: string | null
          finance_transaction_id?: string | null
          id?: string
          notes?: string | null
          paid_date?: string
          payment_method?: string | null
          receipt_id: string
          reference_no?: string | null
        }
        Update: {
          amount_toman?: number
          created_at?: string
          created_by?: string | null
          finance_transaction_id?: string | null
          id?: string
          notes?: string | null
          paid_date?: string
          payment_method?: string | null
          receipt_id?: string
          reference_no?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_committee_payments_finance_transaction_id_fkey"
            columns: ["finance_transaction_id"]
            isOneToOne: false
            referencedRelation: "finance_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_committee_payments_receipt_id_fkey"
            columns: ["receipt_id"]
            isOneToOne: false
            referencedRelation: "equipment_committee_receipts"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_committee_receipt_items: {
        Row: {
          created_at: string
          id: string
          item_key: string
          notes: string | null
          quantity: number
          receipt_id: string
          total_cost_toman: number | null
          unit_cost_toman: number
        }
        Insert: {
          created_at?: string
          id?: string
          item_key: string
          notes?: string | null
          quantity: number
          receipt_id: string
          total_cost_toman?: number | null
          unit_cost_toman: number
        }
        Update: {
          created_at?: string
          id?: string
          item_key?: string
          notes?: string | null
          quantity?: number
          receipt_id?: string
          total_cost_toman?: number | null
          unit_cost_toman?: number
        }
        Relationships: [
          {
            foreignKeyName: "equipment_committee_receipt_items_receipt_id_fkey"
            columns: ["receipt_id"]
            isOneToOne: false
            referencedRelation: "equipment_committee_receipts"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_committee_receipts: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          received_date: string
          received_from: string
          reference_no: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          received_date?: string
          received_from?: string
          reference_no?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          received_date?: string
          received_from?: string
          reference_no?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      field_definitions: {
        Row: {
          field_key: string
          field_type: string
          id: string
          is_enabled: boolean | null
          is_required: boolean | null
          is_sensitive: boolean | null
          is_system_field: boolean | null
          label: string
          module_key: string
          sort_order: number | null
        }
        Insert: {
          field_key: string
          field_type?: string
          id?: string
          is_enabled?: boolean | null
          is_required?: boolean | null
          is_sensitive?: boolean | null
          is_system_field?: boolean | null
          label: string
          module_key: string
          sort_order?: number | null
        }
        Update: {
          field_key?: string
          field_type?: string
          id?: string
          is_enabled?: boolean | null
          is_required?: boolean | null
          is_sensitive?: boolean | null
          is_system_field?: boolean | null
          label?: string
          module_key?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      finance_accounts: {
        Row: {
          account_code: string
          account_name: string
          account_type: string | null
          created_at: string
          id: string
          is_active: boolean
          notes: string | null
        }
        Insert: {
          account_code: string
          account_name: string
          account_type?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          notes?: string | null
        }
        Update: {
          account_code?: string
          account_name?: string
          account_type?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          notes?: string | null
        }
        Relationships: []
      }
      finance_installments: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          due_date: string
          id: string
          installment_number: number
          khadem_id: string | null
          notes: string | null
          paid_amount: number
          paid_date: string | null
          status: string
          transaction_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          created_by?: string | null
          due_date: string
          id?: string
          installment_number: number
          khadem_id?: string | null
          notes?: string | null
          paid_amount?: number
          paid_date?: string | null
          status?: string
          transaction_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          due_date?: string
          id?: string
          installment_number?: number
          khadem_id?: string | null
          notes?: string | null
          paid_amount?: number
          paid_date?: string | null
          status?: string
          transaction_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "finance_installments_khadem_id_fkey"
            columns: ["khadem_id"]
            isOneToOne: false
            referencedRelation: "friday_overdue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_installments_khadem_id_fkey"
            columns: ["khadem_id"]
            isOneToOne: false
            referencedRelation: "khadem_service_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_installments_khadem_id_fkey"
            columns: ["khadem_id"]
            isOneToOne: false
            referencedRelation: "khadems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_installments_khadem_id_fkey"
            columns: ["khadem_id"]
            isOneToOne: false
            referencedRelation: "khadems_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_installments_khadem_id_fkey"
            columns: ["khadem_id"]
            isOneToOne: false
            referencedRelation: "meeting_attendance_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_installments_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "finance_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_pricing: {
        Row: {
          annual_tuition_toman: number
          id: number
          item_prices: Json
          membership_fee_rules: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          annual_tuition_toman?: number
          id?: number
          item_prices?: Json
          membership_fee_rules?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          annual_tuition_toman?: number
          id?: number
          item_prices?: Json
          membership_fee_rules?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      finance_transactions: {
        Row: {
          account_id: string | null
          amount: number
          category: string | null
          created_at: string | null
          created_by: string | null
          created_by_email: string | null
          description: string | null
          id: string
          khadem_code: number | null
          khadem_id: string | null
          khadem_name: string | null
          notes: string | null
          party: string | null
          payment_method: string | null
          receipt_image_path: string | null
          reference_no: string | null
          status: string
          title: string | null
          tracking_number: string | null
          transaction_date: string
          transaction_type: string
        }
        Insert: {
          account_id?: string | null
          amount?: number
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          created_by_email?: string | null
          description?: string | null
          id?: string
          khadem_code?: number | null
          khadem_id?: string | null
          khadem_name?: string | null
          notes?: string | null
          party?: string | null
          payment_method?: string | null
          receipt_image_path?: string | null
          reference_no?: string | null
          status?: string
          title?: string | null
          tracking_number?: string | null
          transaction_date?: string
          transaction_type: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          created_by_email?: string | null
          description?: string | null
          id?: string
          khadem_code?: number | null
          khadem_id?: string | null
          khadem_name?: string | null
          notes?: string | null
          party?: string | null
          payment_method?: string | null
          receipt_image_path?: string | null
          reference_no?: string | null
          status?: string
          title?: string | null
          tracking_number?: string | null
          transaction_date?: string
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "finance_transactions_khadem_id_fkey"
            columns: ["khadem_id"]
            isOneToOne: false
            referencedRelation: "friday_overdue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_transactions_khadem_id_fkey"
            columns: ["khadem_id"]
            isOneToOne: false
            referencedRelation: "khadem_service_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_transactions_khadem_id_fkey"
            columns: ["khadem_id"]
            isOneToOne: false
            referencedRelation: "khadems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_transactions_khadem_id_fkey"
            columns: ["khadem_id"]
            isOneToOne: false
            referencedRelation: "khadems_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_transactions_khadem_id_fkey"
            columns: ["khadem_id"]
            isOneToOne: false
            referencedRelation: "meeting_attendance_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      fund_transactions: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          notes: string | null
          status: string
          title: string | null
          transaction_date: string
          transaction_type: string
        }
        Insert: {
          amount?: number
          created_at?: string | null
          id?: string
          notes?: string | null
          status?: string
          title?: string | null
          transaction_date?: string
          transaction_type: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          notes?: string | null
          status?: string
          title?: string | null
          transaction_date?: string
          transaction_type?: string
        }
        Relationships: []
      }
      funds: {
        Row: {
          created_at: string | null
          description: string | null
          fund_code: string | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          fund_code?: string | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          fund_code?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      khadem_equipment_issues: {
        Row: {
          created_at: string
          created_by: string | null
          delivery_date: string | null
          id: string
          issue_date: string
          issue_status: string
          item_key: string
          khadem_id: string
          notes: string | null
          order_date: string | null
          quantity: number
          shirt_size: string | null
          source_receipt_item_id: string | null
          tailor_name: string | null
          total_amount_toman: number | null
          unit_price_toman: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          delivery_date?: string | null
          id?: string
          issue_date?: string
          issue_status?: string
          item_key: string
          khadem_id: string
          notes?: string | null
          order_date?: string | null
          quantity?: number
          shirt_size?: string | null
          source_receipt_item_id?: string | null
          tailor_name?: string | null
          total_amount_toman?: number | null
          unit_price_toman: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          delivery_date?: string | null
          id?: string
          issue_date?: string
          issue_status?: string
          item_key?: string
          khadem_id?: string
          notes?: string | null
          order_date?: string | null
          quantity?: number
          shirt_size?: string | null
          source_receipt_item_id?: string | null
          tailor_name?: string | null
          total_amount_toman?: number | null
          unit_price_toman?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "khadem_equipment_issues_khadem_id_fkey"
            columns: ["khadem_id"]
            isOneToOne: false
            referencedRelation: "friday_overdue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "khadem_equipment_issues_khadem_id_fkey"
            columns: ["khadem_id"]
            isOneToOne: false
            referencedRelation: "khadem_service_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "khadem_equipment_issues_khadem_id_fkey"
            columns: ["khadem_id"]
            isOneToOne: false
            referencedRelation: "khadems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "khadem_equipment_issues_khadem_id_fkey"
            columns: ["khadem_id"]
            isOneToOne: false
            referencedRelation: "khadems_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "khadem_equipment_issues_khadem_id_fkey"
            columns: ["khadem_id"]
            isOneToOne: false
            referencedRelation: "meeting_attendance_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "khadem_equipment_issues_source_receipt_item_id_fkey"
            columns: ["source_receipt_item_id"]
            isOneToOne: false
            referencedRelation: "equipment_committee_receipt_items"
            referencedColumns: ["id"]
          },
        ]
      }
      khadem_equipment_payments: {
        Row: {
          amount_toman: number
          created_at: string
          created_by: string | null
          finance_transaction_id: string | null
          id: string
          issue_id: string
          notes: string | null
          paid_date: string
          payment_method: string | null
          reference_no: string | null
        }
        Insert: {
          amount_toman: number
          created_at?: string
          created_by?: string | null
          finance_transaction_id?: string | null
          id?: string
          issue_id: string
          notes?: string | null
          paid_date?: string
          payment_method?: string | null
          reference_no?: string | null
        }
        Update: {
          amount_toman?: number
          created_at?: string
          created_by?: string | null
          finance_transaction_id?: string | null
          id?: string
          issue_id?: string
          notes?: string | null
          paid_date?: string
          payment_method?: string | null
          reference_no?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "khadem_equipment_payments_finance_transaction_id_fkey"
            columns: ["finance_transaction_id"]
            isOneToOne: false
            referencedRelation: "finance_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "khadem_equipment_payments_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "khadem_equipment_issues"
            referencedColumns: ["id"]
          },
        ]
      }
      khadem_receipt_attachments: {
        Row: {
          created_at: string
          file_name: string | null
          file_path: string | null
          file_size: number | null
          id: string
          mime_type: string | null
          notes: string | null
          receipt_type: string
          record_id: string
          record_table: string
          sender_name: string | null
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          mime_type?: string | null
          notes?: string | null
          receipt_type?: string
          record_id: string
          record_table: string
          sender_name?: string | null
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          file_name?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          mime_type?: string | null
          notes?: string | null
          receipt_type?: string
          record_id?: string
          record_table?: string
          sender_name?: string | null
          uploaded_by?: string | null
        }
        Relationships: []
      }
      khadem_service_nonattendance: {
        Row: {
          cost_paid_toman: number
          cost_total_toman: number
          created_at: string
          created_by: string | null
          id: string
          khadem_id: string
          notes: string | null
          planned_service_date: string
          preparation_completed: boolean
          reason_code: string
          reason_details: string | null
          refund_amount_toman: number
          resolution_status: string
          service_kind: string
          updated_at: string
        }
        Insert: {
          cost_paid_toman?: number
          cost_total_toman?: number
          created_at?: string
          created_by?: string | null
          id?: string
          khadem_id: string
          notes?: string | null
          planned_service_date: string
          preparation_completed?: boolean
          reason_code: string
          reason_details?: string | null
          refund_amount_toman?: number
          resolution_status?: string
          service_kind: string
          updated_at?: string
        }
        Update: {
          cost_paid_toman?: number
          cost_total_toman?: number
          created_at?: string
          created_by?: string | null
          id?: string
          khadem_id?: string
          notes?: string | null
          planned_service_date?: string
          preparation_completed?: boolean
          reason_code?: string
          reason_details?: string | null
          refund_amount_toman?: number
          resolution_status?: string
          service_kind?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "khadem_service_nonattendance_khadem_id_fkey"
            columns: ["khadem_id"]
            isOneToOne: false
            referencedRelation: "friday_overdue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "khadem_service_nonattendance_khadem_id_fkey"
            columns: ["khadem_id"]
            isOneToOne: false
            referencedRelation: "khadem_service_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "khadem_service_nonattendance_khadem_id_fkey"
            columns: ["khadem_id"]
            isOneToOne: false
            referencedRelation: "khadems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "khadem_service_nonattendance_khadem_id_fkey"
            columns: ["khadem_id"]
            isOneToOne: false
            referencedRelation: "khadems_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "khadem_service_nonattendance_khadem_id_fkey"
            columns: ["khadem_id"]
            isOneToOne: false
            referencedRelation: "meeting_attendance_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      khadems: {
        Row: {
          birth_date: string | null
          blood_type: string | null
          created_at: string
          description: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          extra_data: Json
          father_name: string | null
          first_friday_service_date: string | null
          first_main_service_date: string | null
          friday_service_count: number | null
          full_name: string
          id: string
          is_active: boolean
          khadem_code: number
          last_friday_service_date: string | null
          last_main_service_date: string | null
          main_service_count: number | null
          medical_history: string | null
          membership_date: string | null
          national_id: string | null
          notes: string | null
          occupation: string | null
          phone: string | null
          photo_path: string | null
          photo_url: string | null
          residence: string | null
          responsibility: string | null
          service_count: number
          service_days: number
          status: string | null
          total_service_days: number | null
          tri_name: string | null
          tuition_exempt: boolean
          tuition_exempt_from: string | null
          tuition_exempt_note: string | null
          tuition_exempt_until: string | null
          updated_at: string
        }
        Insert: {
          birth_date?: string | null
          blood_type?: string | null
          created_at?: string
          description?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          extra_data?: Json
          father_name?: string | null
          first_friday_service_date?: string | null
          first_main_service_date?: string | null
          friday_service_count?: number | null
          full_name: string
          id?: string
          is_active?: boolean
          khadem_code: number
          last_friday_service_date?: string | null
          last_main_service_date?: string | null
          main_service_count?: number | null
          medical_history?: string | null
          membership_date?: string | null
          national_id?: string | null
          notes?: string | null
          occupation?: string | null
          phone?: string | null
          photo_path?: string | null
          photo_url?: string | null
          residence?: string | null
          responsibility?: string | null
          service_count?: number
          service_days?: number
          status?: string | null
          total_service_days?: number | null
          tri_name?: string | null
          tuition_exempt?: boolean
          tuition_exempt_from?: string | null
          tuition_exempt_note?: string | null
          tuition_exempt_until?: string | null
          updated_at?: string
        }
        Update: {
          birth_date?: string | null
          blood_type?: string | null
          created_at?: string
          description?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          extra_data?: Json
          father_name?: string | null
          first_friday_service_date?: string | null
          first_main_service_date?: string | null
          friday_service_count?: number | null
          full_name?: string
          id?: string
          is_active?: boolean
          khadem_code?: number
          last_friday_service_date?: string | null
          last_main_service_date?: string | null
          main_service_count?: number | null
          medical_history?: string | null
          membership_date?: string | null
          national_id?: string | null
          notes?: string | null
          occupation?: string | null
          phone?: string | null
          photo_path?: string | null
          photo_url?: string | null
          residence?: string | null
          responsibility?: string | null
          service_count?: number
          service_days?: number
          status?: string | null
          total_service_days?: number | null
          tri_name?: string | null
          tuition_exempt?: boolean
          tuition_exempt_from?: string | null
          tuition_exempt_note?: string | null
          tuition_exempt_until?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      khadems_backup_before_code_migration: {
        Row: {
          birth_date: string | null
          blood_type: string | null
          created_at: string | null
          description: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          extra_data: Json | null
          father_name: string | null
          first_friday_service_date: string | null
          first_main_service_date: string | null
          friday_service_count: number | null
          full_name: string | null
          id: string | null
          is_active: boolean | null
          khadem_code: string | null
          last_friday_service_date: string | null
          last_main_service_date: string | null
          main_service_count: number | null
          medical_history: string | null
          membership_date: string | null
          national_id: string | null
          notes: string | null
          occupation: string | null
          phone: string | null
          photo_path: string | null
          photo_url: string | null
          residence: string | null
          responsibility: string | null
          service_count: number | null
          service_days: number | null
          status: string | null
          total_service_days: number | null
          tri_name: string | null
          updated_at: string | null
        }
        Insert: {
          birth_date?: string | null
          blood_type?: string | null
          created_at?: string | null
          description?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          extra_data?: Json | null
          father_name?: string | null
          first_friday_service_date?: string | null
          first_main_service_date?: string | null
          friday_service_count?: number | null
          full_name?: string | null
          id?: string | null
          is_active?: boolean | null
          khadem_code?: string | null
          last_friday_service_date?: string | null
          last_main_service_date?: string | null
          main_service_count?: number | null
          medical_history?: string | null
          membership_date?: string | null
          national_id?: string | null
          notes?: string | null
          occupation?: string | null
          phone?: string | null
          photo_path?: string | null
          photo_url?: string | null
          residence?: string | null
          responsibility?: string | null
          service_count?: number | null
          service_days?: number | null
          status?: string | null
          total_service_days?: number | null
          tri_name?: string | null
          updated_at?: string | null
        }
        Update: {
          birth_date?: string | null
          blood_type?: string | null
          created_at?: string | null
          description?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          extra_data?: Json | null
          father_name?: string | null
          first_friday_service_date?: string | null
          first_main_service_date?: string | null
          friday_service_count?: number | null
          full_name?: string | null
          id?: string | null
          is_active?: boolean | null
          khadem_code?: string | null
          last_friday_service_date?: string | null
          last_main_service_date?: string | null
          main_service_count?: number | null
          medical_history?: string | null
          membership_date?: string | null
          national_id?: string | null
          notes?: string | null
          occupation?: string | null
          phone?: string | null
          photo_path?: string | null
          photo_url?: string | null
          residence?: string | null
          responsibility?: string | null
          service_count?: number | null
          service_days?: number | null
          status?: string | null
          total_service_days?: number | null
          tri_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      meeting_attendance: {
        Row: {
          id: string
          khadem_id: string
          meeting_id: string
          notes: string | null
          reason: string | null
          status: string
        }
        Insert: {
          id?: string
          khadem_id: string
          meeting_id: string
          notes?: string | null
          reason?: string | null
          status?: string
        }
        Update: {
          id?: string
          khadem_id?: string
          meeting_id?: string
          notes?: string | null
          reason?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_attendance_khadem_id_fkey"
            columns: ["khadem_id"]
            isOneToOne: false
            referencedRelation: "friday_overdue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_attendance_khadem_id_fkey"
            columns: ["khadem_id"]
            isOneToOne: false
            referencedRelation: "khadem_service_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_attendance_khadem_id_fkey"
            columns: ["khadem_id"]
            isOneToOne: false
            referencedRelation: "khadems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_attendance_khadem_id_fkey"
            columns: ["khadem_id"]
            isOneToOne: false
            referencedRelation: "khadems_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_attendance_khadem_id_fkey"
            columns: ["khadem_id"]
            isOneToOne: false
            referencedRelation: "meeting_attendance_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_attendance_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_invitees: {
        Row: {
          absence_type: string | null
          arrival_session_start: boolean
          arrival_time: string | null
          attendance_recorded_at: string | null
          attendance_status: string
          created_at: string
          departure_session_end: boolean
          departure_time: string | null
          excuse_reason: string | null
          id: string
          invite_status: string
          invited_at: string
          invited_by: string | null
          khadem_code: number | null
          khadem_id: string
          khadem_name: string
          meeting_id: string
          notes: string | null
          updated_at: string
        }
        Insert: {
          absence_type?: string | null
          arrival_session_start?: boolean
          arrival_time?: string | null
          attendance_recorded_at?: string | null
          attendance_status?: string
          created_at?: string
          departure_session_end?: boolean
          departure_time?: string | null
          excuse_reason?: string | null
          id?: string
          invite_status?: string
          invited_at?: string
          invited_by?: string | null
          khadem_code?: number | null
          khadem_id: string
          khadem_name?: string
          meeting_id: string
          notes?: string | null
          updated_at?: string
        }
        Update: {
          absence_type?: string | null
          arrival_session_start?: boolean
          arrival_time?: string | null
          attendance_recorded_at?: string | null
          attendance_status?: string
          created_at?: string
          departure_session_end?: boolean
          departure_time?: string | null
          excuse_reason?: string | null
          id?: string
          invite_status?: string
          invited_at?: string
          invited_by?: string | null
          khadem_code?: number | null
          khadem_id?: string
          khadem_name?: string
          meeting_id?: string
          notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_invitees_khadem_id_fkey"
            columns: ["khadem_id"]
            isOneToOne: false
            referencedRelation: "friday_overdue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_invitees_khadem_id_fkey"
            columns: ["khadem_id"]
            isOneToOne: false
            referencedRelation: "khadem_service_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_invitees_khadem_id_fkey"
            columns: ["khadem_id"]
            isOneToOne: false
            referencedRelation: "khadems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_invitees_khadem_id_fkey"
            columns: ["khadem_id"]
            isOneToOne: false
            referencedRelation: "khadems_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_invitees_khadem_id_fkey"
            columns: ["khadem_id"]
            isOneToOne: false
            referencedRelation: "meeting_attendance_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_invitees_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      meetings: {
        Row: {
          created_at: string
          created_by: string | null
          end_time: string | null
          id: string
          invite_count: number
          invite_mode: string
          location: string | null
          meeting_date: string
          meeting_time: string | null
          meeting_type: string
          notes: string | null
          owner: string | null
          start_time: string | null
          status: string
          title: string
          topic: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          end_time?: string | null
          id?: string
          invite_count?: number
          invite_mode?: string
          location?: string | null
          meeting_date: string
          meeting_time?: string | null
          meeting_type?: string
          notes?: string | null
          owner?: string | null
          start_time?: string | null
          status?: string
          title: string
          topic?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          end_time?: string | null
          id?: string
          invite_count?: number
          invite_mode?: string
          location?: string | null
          meeting_date?: string
          meeting_time?: string | null
          meeting_type?: string
          notes?: string | null
          owner?: string | null
          start_time?: string | null
          status?: string
          title?: string
          topic?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      password_reset_requests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          attempts: number
          completed_at: string | null
          created_at: string
          email: string
          id: string
          otp_expires_at: string | null
          otp_hash: string | null
          phone: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          attempts?: number
          completed_at?: string | null
          created_at?: string
          email: string
          id?: string
          otp_expires_at?: string | null
          otp_hash?: string | null
          phone: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          attempts?: number
          completed_at?: string | null
          created_at?: string
          email?: string
          id?: string
          otp_expires_at?: string | null
          otp_hash?: string | null
          phone?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      permissions: {
        Row: {
          created_at: string | null
          id: string
          permission_key: string
          title: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          permission_key: string
          title: string
        }
        Update: {
          created_at?: string | null
          id?: string
          permission_key?: string
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          full_name: string | null
          id: string
          is_active: boolean
          phone: string | null
          role: string
          updated_at: string
          username: string | null
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          is_active?: boolean
          phone?: string | null
          role?: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean
          phone?: string | null
          role?: string
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      registration_requests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          phone: string | null
          rejection_reason: string | null
          requested_role: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          phone?: string | null
          rejection_reason?: string | null
          requested_role?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          rejection_reason?: string | null
          requested_role?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          permission_id: string
          role_id: string
        }
        Insert: {
          permission_id: string
          role_id: string
        }
        Update: {
          permission_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "app_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_records: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          duration_minutes: number | null
          end_time: string | null
          id: string
          khadem_code: number | null
          khadem_id: string
          khadem_name: string | null
          location: string | null
          notes: string | null
          responsibility: string | null
          service_date: string
          service_days: number
          service_type: string | null
          shrine_id: string | null
          start_time: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_minutes?: number | null
          end_time?: string | null
          id?: string
          khadem_code?: number | null
          khadem_id: string
          khadem_name?: string | null
          location?: string | null
          notes?: string | null
          responsibility?: string | null
          service_date: string
          service_days?: number
          service_type?: string | null
          shrine_id?: string | null
          start_time?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_minutes?: number | null
          end_time?: string | null
          id?: string
          khadem_code?: number | null
          khadem_id?: string
          khadem_name?: string | null
          location?: string | null
          notes?: string | null
          responsibility?: string | null
          service_date?: string
          service_days?: number
          service_type?: string | null
          shrine_id?: string | null
          start_time?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_records_khadem_id_fkey"
            columns: ["khadem_id"]
            isOneToOne: false
            referencedRelation: "friday_overdue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_records_khadem_id_fkey"
            columns: ["khadem_id"]
            isOneToOne: false
            referencedRelation: "khadem_service_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_records_khadem_id_fkey"
            columns: ["khadem_id"]
            isOneToOne: false
            referencedRelation: "khadems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_records_khadem_id_fkey"
            columns: ["khadem_id"]
            isOneToOne: false
            referencedRelation: "khadems_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_records_khadem_id_fkey"
            columns: ["khadem_id"]
            isOneToOne: false
            referencedRelation: "meeting_attendance_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      shrine_sites: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          notes: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          notes?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          notes?: string | null
        }
        Relationships: []
      }
      signup_rate_limits: {
        Row: {
          attempts: number
          ip_hash: string
          updated_at: string
          window_start: string
        }
        Insert: {
          attempts?: number
          ip_hash: string
          updated_at?: string
          window_start: string
        }
        Update: {
          attempts?: number
          ip_hash?: string
          updated_at?: string
          window_start?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          key: string
          updated_at: string | null
          value_json: Json
        }
        Insert: {
          key: string
          updated_at?: string | null
          value_json?: Json
        }
        Update: {
          key?: string
          updated_at?: string | null
          value_json?: Json
        }
        Relationships: []
      }
      tuition_dues: {
        Row: {
          amount_toman: number
          created_at: string
          created_by: string | null
          finance_transaction_id: string | null
          id: string
          khadem_id: string
          notes: string | null
          paid_toman: number
          period_month: string
          period_type: string | null
          period_year: number | null
          status: string
          updated_at: string
        }
        Insert: {
          amount_toman: number
          created_at?: string
          created_by?: string | null
          finance_transaction_id?: string | null
          id?: string
          khadem_id: string
          notes?: string | null
          paid_toman?: number
          period_month: string
          period_type?: string | null
          period_year?: number | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount_toman?: number
          created_at?: string
          created_by?: string | null
          finance_transaction_id?: string | null
          id?: string
          khadem_id?: string
          notes?: string | null
          paid_toman?: number
          period_month?: string
          period_type?: string | null
          period_year?: number | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tuition_dues_finance_transaction_id_fkey"
            columns: ["finance_transaction_id"]
            isOneToOne: false
            referencedRelation: "finance_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tuition_dues_khadem_id_fkey"
            columns: ["khadem_id"]
            isOneToOne: false
            referencedRelation: "friday_overdue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tuition_dues_khadem_id_fkey"
            columns: ["khadem_id"]
            isOneToOne: false
            referencedRelation: "khadem_service_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tuition_dues_khadem_id_fkey"
            columns: ["khadem_id"]
            isOneToOne: false
            referencedRelation: "khadems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tuition_dues_khadem_id_fkey"
            columns: ["khadem_id"]
            isOneToOne: false
            referencedRelation: "khadems_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tuition_dues_khadem_id_fkey"
            columns: ["khadem_id"]
            isOneToOne: false
            referencedRelation: "meeting_attendance_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      tuition_payments: {
        Row: {
          amount_toman: number
          created_at: string
          created_by: string | null
          finance_transaction_id: string | null
          id: string
          khadem_id: string
          notes: string | null
          paid_date: string
          tuition_due_id: string
        }
        Insert: {
          amount_toman: number
          created_at?: string
          created_by?: string | null
          finance_transaction_id?: string | null
          id?: string
          khadem_id: string
          notes?: string | null
          paid_date?: string
          tuition_due_id: string
        }
        Update: {
          amount_toman?: number
          created_at?: string
          created_by?: string | null
          finance_transaction_id?: string | null
          id?: string
          khadem_id?: string
          notes?: string | null
          paid_date?: string
          tuition_due_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tuition_payments_finance_transaction_id_fkey"
            columns: ["finance_transaction_id"]
            isOneToOne: false
            referencedRelation: "finance_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tuition_payments_khadem_id_fkey"
            columns: ["khadem_id"]
            isOneToOne: false
            referencedRelation: "friday_overdue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tuition_payments_khadem_id_fkey"
            columns: ["khadem_id"]
            isOneToOne: false
            referencedRelation: "khadem_service_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tuition_payments_khadem_id_fkey"
            columns: ["khadem_id"]
            isOneToOne: false
            referencedRelation: "khadems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tuition_payments_khadem_id_fkey"
            columns: ["khadem_id"]
            isOneToOne: false
            referencedRelation: "khadems_compat"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tuition_payments_khadem_id_fkey"
            columns: ["khadem_id"]
            isOneToOne: false
            referencedRelation: "meeting_attendance_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tuition_payments_tuition_due_id_fkey"
            columns: ["tuition_due_id"]
            isOneToOne: false
            referencedRelation: "tuition_dues"
            referencedColumns: ["id"]
          },
        ]
      }
      tuition_settings: {
        Row: {
          after_six_monthly_toman: number
          created_at: string
          effective_from: string
          first_six_monthly_toman: number
          id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          after_six_monthly_toman?: number
          created_at?: string
          effective_from?: string
          first_six_monthly_toman?: number
          id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          after_six_monthly_toman?: number
          created_at?: string
          effective_from?: string
          first_six_monthly_toman?: number
          id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      user_access_profiles: {
        Row: {
          is_custom: boolean
          permissions: Json
          updated_at: string
          updated_by: string | null
          user_id: string
        }
        Insert: {
          is_custom?: boolean
          permissions?: Json
          updated_at?: string
          updated_by?: string | null
          user_id: string
        }
        Update: {
          is_custom?: boolean
          permissions?: Json
          updated_at?: string
          updated_by?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_presence: {
        Row: {
          last_seen_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          last_seen_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          last_seen_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          capacity: number | null
          created_at: string | null
          driver_name: string | null
          id: string
          model: string | null
          notes: string | null
          owner_name: string | null
          plate: string | null
          plate_number: string | null
          status: string
          updated_at: string
          vehicle_type: string | null
        }
        Insert: {
          capacity?: number | null
          created_at?: string | null
          driver_name?: string | null
          id?: string
          model?: string | null
          notes?: string | null
          owner_name?: string | null
          plate?: string | null
          plate_number?: string | null
          status?: string
          updated_at?: string
          vehicle_type?: string | null
        }
        Update: {
          capacity?: number | null
          created_at?: string | null
          driver_name?: string | null
          id?: string
          model?: string | null
          notes?: string | null
          owner_name?: string | null
          plate?: string | null
          plate_number?: string | null
          status?: string
          updated_at?: string
          vehicle_type?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      chat_recipients: {
        Row: {
          display_name: string | null
          role: string | null
          user_id: string | null
        }
        Insert: {
          display_name?: never
          role?: string | null
          user_id?: string | null
        }
        Update: {
          display_name?: never
          role?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      finance_balance_summary: {
        Row: {
          balance: number | null
          total_expense: number | null
          total_income: number | null
        }
        Relationships: []
      }
      friday_overdue: {
        Row: {
          days_since_friday: number | null
          first_friday_date: string | null
          first_main_date: string | null
          friday_count: number | null
          full_name: string | null
          id: string | null
          khadem_code: number | null
          last_friday_date: string | null
          last_main_date: string | null
          main_count: number | null
          status: string | null
          tri_name: string | null
        }
        Relationships: []
      }
      fund_balance_summary: {
        Row: {
          balance: number | null
          total_expense: number | null
          total_income: number | null
        }
        Relationships: []
      }
      khadem_service_summary: {
        Row: {
          first_friday_date: string | null
          first_main_date: string | null
          friday_count: number | null
          full_name: string | null
          id: string | null
          khadem_code: number | null
          last_friday_date: string | null
          last_main_date: string | null
          main_count: number | null
          status: string | null
          tri_name: string | null
        }
        Relationships: []
      }
      khadems_compat: {
        Row: {
          birth_date: string | null
          blood_type: string | null
          created_at: string | null
          description: string | null
          father_name: string | null
          first_friday_service_date: string | null
          first_main_service_date: string | null
          first_name: string | null
          friday_service_count: number | null
          full_name: string | null
          id: string | null
          is_active: boolean | null
          khadem_code: number | null
          last_friday_service_date: string | null
          last_main_service_date: string | null
          main_service_count: number | null
          medical_history: string | null
          membership_date: string | null
          national_id: string | null
          occupation: string | null
          phone: string | null
          photo_path: string | null
          photo_url: string | null
          residence: string | null
          responsibility: string | null
          service_count: number | null
          service_days: number | null
          status: string | null
          total_service_days: number | null
          tri_name: string | null
          triad_name: string | null
          updated_at: string | null
        }
        Insert: {
          birth_date?: string | null
          blood_type?: string | null
          created_at?: string | null
          description?: string | null
          father_name?: string | null
          first_friday_service_date?: string | null
          first_main_service_date?: string | null
          first_name?: string | null
          friday_service_count?: number | null
          full_name?: string | null
          id?: string | null
          is_active?: boolean | null
          khadem_code?: number | null
          last_friday_service_date?: string | null
          last_main_service_date?: string | null
          main_service_count?: number | null
          medical_history?: string | null
          membership_date?: string | null
          national_id?: string | null
          occupation?: string | null
          phone?: string | null
          photo_path?: string | null
          photo_url?: string | null
          residence?: string | null
          responsibility?: string | null
          service_count?: number | null
          service_days?: number | null
          status?: string | null
          total_service_days?: number | null
          tri_name?: string | null
          triad_name?: string | null
          updated_at?: string | null
        }
        Update: {
          birth_date?: string | null
          blood_type?: string | null
          created_at?: string | null
          description?: string | null
          father_name?: string | null
          first_friday_service_date?: string | null
          first_main_service_date?: string | null
          first_name?: string | null
          friday_service_count?: number | null
          full_name?: string | null
          id?: string | null
          is_active?: boolean | null
          khadem_code?: number | null
          last_friday_service_date?: string | null
          last_main_service_date?: string | null
          main_service_count?: number | null
          medical_history?: string | null
          membership_date?: string | null
          national_id?: string | null
          occupation?: string | null
          phone?: string | null
          photo_path?: string | null
          photo_url?: string | null
          residence?: string | null
          responsibility?: string | null
          service_count?: number | null
          service_days?: number | null
          status?: string | null
          total_service_days?: number | null
          tri_name?: string | null
          triad_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      meeting_attendance_summary: {
        Row: {
          absent_count: number | null
          excused_count: number | null
          full_name: string | null
          id: string | null
          invited_count: number | null
          khadem_code: number | null
          late_count: number | null
          present_count: number | null
        }
        Relationships: []
      }
      meeting_stats_summary: {
        Row: {
          absent_count: number | null
          attendance_percent: number | null
          excused_count: number | null
          held_sessions: number | null
          invitees: number | null
          late_count: number | null
          meeting_type: string | null
          present_count: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      chat_directory: {
        Args: never
        Returns: {
          display_name: string
          id: string
          role: string
        }[]
      }
      chat_is_member: { Args: { p_conversation_id: string }; Returns: boolean }
      get_my_role: { Args: never; Returns: string }
      has_app_permission: { Args: { p_permission: string }; Returns: boolean }
      register_tuition_payment: {
        Args: {
          p_amount_toman: number
          p_notes?: string
          p_paid_date?: string
          p_payment_method?: string
          p_reference_no?: string
          p_tuition_due_id: string
        }
        Returns: string
      }
      register_tuition_payment_with_receipt: {
        Args: {
          p_amount_toman: number
          p_notes?: string
          p_paid_date?: string
          p_payment_method?: string
          p_receipt_image_path?: string
          p_reference_no?: string
          p_tuition_due_id: string
        }
        Returns: string
      }
      register_tuition_period_payment: {
        Args: {
          p_amount_toman: number
          p_khadem_id: string
          p_notes?: string
          p_paid_date?: string
          p_payment_method?: string
          p_period_start: string
          p_period_type: string
          p_period_year: number
          p_receipt_image_path?: string
          p_reference_no?: string
        }
        Returns: string
      }
      update_finance_transaction_audited: {
        Args: {
          p_account_id: string
          p_amount_toman: number
          p_category: string
          p_description: string
          p_id: string
          p_khadem_id: string
          p_party: string
          p_payment_method: string
          p_reference_no: string
          p_title: string
          p_tracking_number: string
          p_transaction_date: string
          p_transaction_type: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
