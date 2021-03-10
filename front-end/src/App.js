import AddUrls from './views/AddUrls.js'
import TopBar from './views/TopBar'
import { SnackbarProvider, useSnackbar } from "notistack";
import getCroppedImage from './CropImageTest.js';

function App() {
  var url = "https://i0.wp.com/cdn-prod.medicalnewstoday.com/content/images/articles/266/266749/aging-man.jpg?w=1155&h=1537"
  var bbox = {h: "280", w: "280", x: "510", y: "172"}
  return (
    <SnackbarProvider>
        {getCroppedImage(url,bbox)}
        <TopBar/>
        <AddUrls/>
    </SnackbarProvider>
  );
}

export default App;
