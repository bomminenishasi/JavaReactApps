// Allow importing SCSS files (CRA handles the actual compilation via sass)
declare module '*.scss' {
  const styles: { [className: string]: string };
  export default styles;
}

declare module '*.sass' {
  const styles: { [className: string]: string };
  export default styles;
}

// Allow importing SVG as React components (CRA built-in)
declare module '*.svg' {
  import * as React from 'react';
  export const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & { title?: string }
  >;
  const src: string;
  export default src;
}

// Allow importing image files
declare module '*.png' { const src: string; export default src; }
declare module '*.jpg' { const src: string; export default src; }
declare module '*.jpeg' { const src: string; export default src; }
declare module '*.gif' { const src: string; export default src; }
declare module '*.webp' { const src: string; export default src; }
