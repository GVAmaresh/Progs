export interface FileInfo {
    name?: string;
    size?: number;
    progress?: string;
  }

  export interface Naming {
    category?: string[];
    drive?: string;
    id?: string;
    summary?: string;
    compare?: string;
    year?: string;
    title?: string;
    project?: string;
  }
  
  export interface ApiResult {
    success?: boolean;
    data?: Naming[];                                     
  }
export interface AccountHolder {
  image: string;
  name: string;
  email: string;
  totalFiles?: string;
}
  