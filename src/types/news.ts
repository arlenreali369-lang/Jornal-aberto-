export type NewsCategory = 
  | 'Todos'
  | 'Destaques'
  | 'Tecnologia'
  | 'Ciência'
  | 'Cultura'
  | 'Economia'
  | 'Mundo'
  | 'Meio Ambiente'
  | 'Sociedade';

export interface NewsComment {
  id: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
}

export interface NewsPost {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  category: Exclude<NewsCategory, 'Todos' | 'Destaques'>;
  coverImage: string;
  coverCaption?: string;
  authorName: string;
  authorHandle: string;
  authorAvatar?: string;
  tags: string[];
  likes: number;
  views: number;
  featured?: boolean;
  breakingNews?: boolean;
  comments: NewsComment[];
  createdAt: string;
  readTimeMinutes: number;
}

export interface CreatePostPayload {
  title: string;
  subtitle: string;
  content: string;
  category: Exclude<NewsCategory, 'Todos' | 'Destaques'>;
  coverImage: string;
  coverCaption?: string;
  authorName: string;
  authorHandle?: string;
  authorAvatar?: string;
  tags: string[];
  breakingNews?: boolean;
  featured?: boolean;
}
