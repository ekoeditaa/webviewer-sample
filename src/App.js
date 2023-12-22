import React, { useRef, useEffect, useState } from "react";
import WebViewer from "@pdftron/webviewer";
import "./App.css";

const App = () => {
  const viewer = useRef(null);
  const [file, setFile] = useState(null);

  // if using a class, equivalent of componentDidMount
  useEffect(() => {
    WebViewer(
      {
        path: "/webviewer/lib",
        initialDoc: "/files/sample.png",
        licenseKey:
          "demo:1699603141853:7cc2b0780300000000239187b4df38ae6bd5fbb91c45b60f3516857af0",
        fullAPI: true,
      },
      viewer.current
    ).then((instance) => {
      const { documentViewer } = instance.Core;

      const ZOOM_LEVEL = 2;

      documentViewer.addEventListener("documentLoaded", async () => {
        const doc = documentViewer.getDocument();
        const currentPage = documentViewer.getCurrentPage();
        const pageInfo = doc.getPageInfo(currentPage);
        console.log("width after document loaded: ", pageInfo.width);
        console.log("height after document loaded: ", pageInfo.height);

        const pageCount = documentViewer.getPageCount();
        const pagesToBeRemoved = [];
        for (let i = 2; i <= pageCount; i++) {
          pagesToBeRemoved.push(i);
        }
        const pageNumber = 1;
        const zoom = ZOOM_LEVEL; // render at twice the resolution
        await doc.removePages(pagesToBeRemoved);
        doc.loadCanvas({
          pageNumber,
          zoom,
          drawComplete: async (canvas) => {
            canvas.toBlob((blob) => {
              if (!blob) {
                return;
              }

              const fr = new FileReader();

              fr.onload = function() {
                // file is loaded
                const img = new Image();

                img.onload = function() {
                  console.log("width after canvas drawComplete: ", img.width); // image is loaded; sizes are available
                  console.log("height after canvas drawComplete: ", img.height); // image is loaded; sizes are available
                };

                img.src = fr.result; // is the data URL because called with readAsDataURL
              };

              fr.readAsDataURL(blob);

              const reader = new FileReader();
              reader.onloadend = () => {
                const binaryData = reader.result;

                const resizedFile = new File(
                  [binaryData],
                  "resized_image.png",
                  {
                    type: "image/png",
                  }
                );
                setFile(resizedFile);
              };

              reader.readAsArrayBuffer(blob);
            }, "image/png");
          },
        });
      });
    });
  }, []);

  return (
    <div className="App">
      <div className="header">React sample</div>
      <div className="webviewer" ref={viewer}></div>
    </div>
  );
};

export default App;
