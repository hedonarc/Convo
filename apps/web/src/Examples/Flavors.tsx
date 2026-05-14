import { config } from "../config";

export default function Flavors() {
  const theme = config.theme;
  return (
    <div style={{ backgroundColor: theme.background }}>
      <h1>{config.name}</h1>
      <p>API: {config.apiBaseUrl}</p>
      <p>Font: {config.font}</p>
      <div style={{ backgroundColor: theme.primary }}>
        <p>Theme primary: {theme.primary}</p>
      </div>
      <div>
        <p>Theme background: {theme.background}</p>
      </div>

      <p>Theme text: {theme.text}</p>
    </div>
  );
}
