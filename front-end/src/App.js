import AddUrls from './views/AddUrls.js'
import TopBar from './views/TopBar'
import { SnackbarProvider, useSnackbar } from "notistack";

function App() {
  return (
    <SnackbarProvider>
        <TopBar/>
        <AddUrls/>
    </SnackbarProvider>
  );
}

export default App;
