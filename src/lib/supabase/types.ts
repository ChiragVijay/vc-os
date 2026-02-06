export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string;
          name: string;
          url: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          url: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          url?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      diligence_reports: {
        Row: {
          id: string;
          company_id: string;
          status: "pending" | "processing" | "completed" | "failed";
          data: Json | null;
          score: number | null;
          sources_used: string[] | null;
          created_at: string;
          completed_at: string | null;
          error: string | null;
        };
        Insert: {
          id?: string;
          company_id: string;
          status: "pending" | "processing" | "completed" | "failed";
          data?: Json | null;
          score?: number | null;
          sources_used?: string[] | null;
          created_at?: string;
          completed_at?: string | null;
          error?: string | null;
        };
        Update: {
          id?: string;
          company_id?: string;
          status?: "pending" | "processing" | "completed" | "failed";
          data?: Json | null;
          score?: number | null;
          sources_used?: string[] | null;
          created_at?: string;
          completed_at?: string | null;
          error?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "diligence_reports_company_id_fkey";
            columns: ["company_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
        ];
      };
      diligence_report_sources: {
        Row: {
          id: string;
          report_id: string;
          source_id: string;
          url: string;
          title: string | null;
          source_type: string;
          snippet: string | null;
          score: number | null;
          ordinal: number;
          referenced_in: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          report_id: string;
          source_id: string;
          url: string;
          title?: string | null;
          source_type: string;
          snippet?: string | null;
          score?: number | null;
          ordinal: number;
          referenced_in?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          report_id?: string;
          source_id?: string;
          url?: string;
          title?: string | null;
          source_type?: string;
          snippet?: string | null;
          score?: number | null;
          ordinal?: number;
          referenced_in?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "diligence_report_sources_report_id_fkey";
            columns: ["report_id"];
            isOneToOne: false;
            referencedRelation: "diligence_reports";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
