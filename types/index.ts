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

export interface Certification {
  id: number;
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  institute_name?: string;
  certificate_pdf?: string;
}

export interface Achievement {
  id: number;
  description: string;
}

export interface Experience {
  id: number;
  company_name: string;
  role: string;
  start_date?: string;
  end_date?: string;
  description?: string;
  skills?: string[];
  company_logo?: string;
  location?: string;
}

export interface Publication {
  id: number;
  paper_name: string;
  conference_name?: string;
  description?: string;
  published_date?: string;
  paper_pdf?: string;
  paper_link?: string;
}

export interface Category {
  id: number;
  name: string;
  user_id: number;
}

export interface Skill {
  id: number;
  name: string;
  category_id?: number;
  category?: Category;
  proficiency_level?: string;
  description?: string;
}

export interface Education {
  id: number;
  university_name: string;
  degree: string;
  from_date?: string;
  end_date?: string;
  location?: string;
  cgpa?: number;
}

export interface ProjectsBoardData {
  userProfile: UserProfile;
  projects: Project[];
  certifications: Certification[];
  achievements: Achievement[];
  experiences: Experience[];
  publications: Publication[];
  skills: Skill[];
  categories: Category[];
  technologies: string[];
  education: Education[];
}
