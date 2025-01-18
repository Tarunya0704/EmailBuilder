export interface EmailTemplate {
    id?: string;
    title: string;
    content: string;
    imageUrl?: string;
    footer?: string;
    style?: {
      titleColor?: string;
      contentColor?: string;
      fontSize?: string;
      alignment?: 'left' | 'center' | 'right';
    };
  }
  