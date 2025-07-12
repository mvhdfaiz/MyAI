
// This allows TypeScript to recognize global variables injected into the window object.
declare global {
  interface Window {
    lucide: {
      createIcons: () => void;
    };
    firebase: any; // Using 'any' as a pragmatic choice for the Firebase SDK loaded via script tag
    // Injected by the platform environment
    _firebase_config?: string;
    _initial_auth_token?: string;
    _app_id?: string;
  }
}

export type AspectRatio = "1:1" | "16:9" | "4:3" | "9:16" | "3:4";

export interface GalleryItem {
  id: string;
  src: string;
  prompt: string;
  createdAt: any; // Firestore ServerTimestamp
}

export interface GeneratorInitialState {
  image?: string;
  prompt?: string;
}

export interface UploadedFile {
    file: File;
    url: string;
}

export type View = 'generator' | 'gallery';

export type LoadingState = 'IDLE' | 'GENERATING' | 'ANALYZING' | 'ENHANCING' | 'INSPIRING';

// This empty export is needed to treat this file as a module.
export {};
