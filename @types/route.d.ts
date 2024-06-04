type Route = {
  name: string;
  results: string[];
  target: number;
  message?: string;
  source?: number;
  relation?: { link: any; description: string | undefined };
};

type NavigateRoute = {
  name: string;
  // results: string[];
  target?: number;
  message?: string;
  // source?: number;
  relation?: { link: any; description: string | undefined };
};
