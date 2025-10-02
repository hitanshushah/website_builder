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
  phone_number?: string;
  secondary_email?: string;
  introduction?: string;
  hide_phone_on_website?: boolean;
  hide_secondary_email_on_website?: boolean;
  hide_introduction_on_website?: boolean;
  override_email?: boolean;
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
  hide_on_website?: boolean;
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
  phone_number?: string;
  secondary_email?: string;
  introduction?: string;
  hide_phone_on_website?: boolean;
  hide_secondary_email_on_website?: boolean;
  hide_introduction_on_website?: boolean;
  override_email?: boolean;
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
  hide_on_website?: boolean;
}

export interface Achievement {
  id: number;
  description: string;
  hide_on_website?: boolean;
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
  hide_on_website?: boolean;
}

export interface Publication {
  id: number;
  paper_name: string;
  conference_name?: string;
  description?: string;
  published_date?: string;
  paper_pdf?: string;
  paper_link?: string;
  hide_on_website?: boolean;
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
  hide_on_website?: boolean;
}

export interface Education {
  id: number;
  university_name: string;
  degree: string;
  from_date?: string;
  end_date?: string;
  location?: string;
  cgpa?: number;
  hide_on_website?: boolean;
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
