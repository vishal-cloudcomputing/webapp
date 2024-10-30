import app from './app';  
import "dotenv/config";

const port = process.env.PORT || 3000;

//testing for A5 trail
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
