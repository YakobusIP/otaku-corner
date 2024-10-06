import app from "./app";
import { env } from "./lib/env";

const PORT = env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
