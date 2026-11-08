// A template (unlike a layout) is re-created on every navigation, so each page fades in.
// Opacity only: a lingering transform would turn this wrapper into the containing block
// for position:fixed children.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="animate-in fade-in duration-300">{children}</div>;
}
