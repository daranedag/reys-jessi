export type Service = {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price_amount: number;
  currency: string;
  active: boolean;
  cal_event_type_id: number | null;
};

export type Slot = {
  start: string;
  end?: string;
};

export type ContentCard = {
  id: string;
  eyebrow?: string;
  title: string;
  description: string;
  imageUrl?: string;
  badge?: string;
};

export type SiteContent = {
  hero: {
    eyebrow: string;
    title: string;
    description: string;
    quote: string;
    imageUrl: string;
  };
  timeline: ContentCard[];
  training: ContentCard[];
  notions: ContentCard[];
  experiences: ContentCard[];
  treatments: ContentCard[];
  testimonials: Array<ContentCard & { personRole: string }>;
  reflections: Array<ContentCard & { closing: string }>;
};
