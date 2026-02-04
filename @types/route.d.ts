type Route = {
  name: string;
  results: string[];
  target: number;
  message?: string;
  source?: number;
  relation?: {
    link: { label: string; display_label: string };
    description: string | undefined;
    description_ja: string | undefined;
  };
};

type NavigateRoute = {
  name: string;
  // results: string[];
  target?: number;
  message?: string;
  // source?: number;
  relation?: {
    link: { label: string; display_label: string };
    description: string | undefined;
    description_ja: string | undefined;
  };
};
