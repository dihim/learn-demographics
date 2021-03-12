from torch.utils.data import Dataset
from PIL import Image
import urllib.request

class FaceDetectionDataset(Dataset):
    def  __init__(self, imageLinks, transform = None):
        self.imageLinks = imageLinks
        self.transform = transform

    def __len__(self):
        return len(self.imageLinks)

    def __getitem__(self, idx):
        #img_loc = os.path.join(self.main_dir, self.total_imgs[idx])
        image = Image.open(urllib.request.urlopen(self.imageLinks[idx])).convert("RGB")
        if self.transform != None:
            image = self.transform(image)
        return image