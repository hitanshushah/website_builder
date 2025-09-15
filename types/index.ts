// types/index.ts
export interface User {
  id: number;
  username: string;
  email: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface Profile {
  id: number;
  user_id: number;
  name: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface ProjectLink {
  title: string;
  url: string;
  type: string;
}

export interface ProjectAsset {
  id: number;
  display_name: string;
  filename: string;
  path: string;
  url: string;
  type: string;
  asset_type: {
    key: string;
    name: string;
  };
}

export interface ProjectSettings {
  id: number;
  project_id: number;
  user_id: number;
  [key: string]: any;
}

export interface Project {
  id: number;
  key: string;
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  is_public: boolean;
  sorting_order?: number;
  created_at: string;
  updated_at: string;
  category?: string;
  status?: string;
  settings?: ProjectSettings;
  links: ProjectLink[];
  assets: ProjectAsset[];
  technologies: string[];
}

export interface UserProfile {
  user_id: number;
  username: string;
  email: string;
  profile_id?: number;
  name?: string;
  designation?: string;
  bio?: string;
  city?: string;
  province?: string;
  country?: string;
  public_url?: string;
  share_profile?: boolean;
  profile_photo_url?: string;
  links: ProjectLink[];
  documents: ProjectAsset[];
}

export interface Category {
  id: number;
  name: string;
  key: string;
}

export interface Status {
  id: number;
  name: string;
  key: string;
}

export interface ProjectsBoardData {
  userProfile: UserProfile;
  projects: Project[];
  categories: Category[];
  statuses: Status[];
  technologies: string[];
}
