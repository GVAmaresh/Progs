export default function cloudfrontLoader({ src, width, quality }: { src: string; width: number; quality?: number }): string {
    const url = new URL(`https://d1kcwss8shbz4z.cloudfront.net/${src}`);
    url.searchParams.set('format', 'auto');
    url.searchParams.set('width', width.toString());
  
    if (quality) {
      url.searchParams.set('quality', quality.toString());
    } else {
      url.searchParams.set('quality', '75'); 
    }
  
    return url.href;
  }
  