export interface Translation {
   [key: string]: {
      title: string;
      text: string;
   };
   en: {
      title: string;
      text: string;
    };
   es: {
      title: string;
      text: string;
   };
   fr: {
      title: string;
      text: string;
   };
   ru: {
      title: string;
      text: string;
   };
   th: {
      title: string;
      text: string;
   };
}
 
export interface Content {
   _id: string;
   branch: string;
   translations:  Translation; // Keys are locale codes like 'en', 'es', etc.
}
 
export interface Branch {
   _id: string;
   name: string;
   order: number;
   pillar: string;
   contentItems: Content[];
}

export interface Pillar {
   _id: string;
   name: string;
   order: number;
   branches: Branch[];
}

export interface DbData {
   pillars: Pillar[];
}
 