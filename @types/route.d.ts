type Route = {
  category: string;
  name: string;
  results: string[];
  target: number;
  message?: string;
  source?: number;
  relation?: { link: any; description: string | undefined };
};

type NavigateRoute = {
  category: string;
  name: string;
  // results: string[];
  target?: number;
  message?: string;
  // source?: number;
  relation?: { link: any; description: string | undefined };
};
