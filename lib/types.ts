export interface ArticleMetadata {
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  tags: string[];
  readTime: string;
  author?: string;
  coverImage?: string;
  publishedAt?: string;
  mediumUrl?: string;
}

export interface Article extends ArticleMetadata {
  content: string;
}

export interface PublishArticlePayload {
  title: string;
  slug: string;
  content: string;
  tags: string[];
  excerpt: string;
  readTime?: string;
  author?: string;
  passcode?: string;
  mediumUrl?: string;
}
