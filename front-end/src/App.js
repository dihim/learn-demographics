import FaceDemographic from './FaceDemographic.js'
import { SnackbarProvider, useSnackbar } from "notistack";

function App() {
  return (
    <SnackbarProvider>
      <div style={{height: "100%"}} className="App">
        <FaceDemographic/>
      </div>
    </SnackbarProvider>

  );
}

export default App;
