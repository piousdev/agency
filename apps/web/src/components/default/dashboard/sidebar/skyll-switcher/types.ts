export interface ActiveTeam {
  readonly name: string;
  readonly plan: string;
  // Logo can be either a URL string or a React component
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  readonly logo: string | React.ElementType;
}
