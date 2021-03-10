import AddUrls from './views/AddUrls.js'
import TopBar from './views/TopBar'
import { SnackbarProvider, useSnackbar } from "notistack";
import getCroppedImage from './CropImageTest'

function App() {
  var url = "https://i0.wp.com/cdn-prod.medicalnewstoday.com/content/images/articles/266/266749/aging-man.jpg?w=1155&h=1537"
  var bbox = {h: "111", w: "111", x: "280", y: "168"}
  return (
    <SnackbarProvider>
        <TopBar/>
        <AddUrls/>
    </SnackbarProvider>
  );
}

export default App;
