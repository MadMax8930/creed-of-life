export interface Translation {
   title: string;
   text: string;
}
 
export interface Content {
   _id: string;
   branch: string;
   translations: {
     [key: string]: Translation; // Keys are locale codes like 'en', 'es', etc.
   };
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
 